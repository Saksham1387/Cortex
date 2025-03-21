import adminDB from "@/firebase-admin";
import { NextApiResponse } from "next";
import admin from "firebase-admin";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generatePrompt, generateQueryPrompt } from "@/app/prompts";
import { incrementRequestCount } from "@/lib/db";
import { rerankResults } from "@/lib/reranker";
 
const { getJson } = require("serpapi");

type Message = {
  text: string;
  products?: any;
  originalProducts?: any; // Add this property to the type definition
  createdAt: admin.firestore.Timestamp;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
};

const client = new GoogleGenerativeAI(process.env.GEMINI_API || "");
const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

const MAX_CONTEXT_MESSAGES = 10;

// Updated POST handler for /api/askQuestion
export async function POST(request: Request, res: NextApiResponse) {
  try {
    const { prompt, chatId, session } = await request.json();

    const userMessage: Message = {
      text: prompt,
      createdAt: admin.firestore.Timestamp.now(),
      user: {
        _id: session.user.email,
        name: session.user.name,
        avatar: session.user.image,
      },
    };

    const messagesRef = adminDB
      .collection("users")
      .doc(session?.user?.email)
      .collection("chats")
      .doc(chatId)
      .collection("messages");

    const prevMessagesSnapshot = await messagesRef
      .orderBy("createdAt", "desc")
      .limit(MAX_CONTEXT_MESSAGES)
      .get();

    const previousMessages: Message[] = [];
    prevMessagesSnapshot.docs.forEach((doc) => {
      previousMessages.push(doc.data() as Message);
    });

    previousMessages.reverse();

    // Step 1: Generate Optimized Search Query
    const queryPrompt = generateQueryPrompt(prompt, previousMessages);
    const queryResult = await model.generateContent([queryPrompt]);
    const optimizedQuery = queryResult.response.text().trim();

    // Step 2: Fetch Search Results
    const searchPromise: Promise<any[]> = new Promise((resolve, reject) => {
      getJson(
        {
          engine: "google_shopping",
          q: optimizedQuery,
          location: "India",
          api_key: process.env.SERP_API,
        },
        (json: any) => {
          if (json && json["shopping_results"]) {
            resolve(json["shopping_results"]);
          } else {
            reject(new Error("No search results found"));
          }
        }
      );
    });
    
    // Store the original results before reranking
    let originalResults = await searchPromise;
    
    // Step 3: Re-Rank the Results using Metadata
    let rerankedResults = await rerankResults([...originalResults], prompt);

    // Step 4: Generate Final LLM Response
    const llmPrompt = generatePrompt(prompt, rerankedResults, previousMessages);
    const result = await model.generateContent([llmPrompt]);

    await messagesRef.add(userMessage);

    const message: Message = {
      text: result.response.text() || "Sorry, I don't understand",
      products: rerankedResults,
      originalProducts: originalResults, // Use the correct property name here
      createdAt: admin.firestore.Timestamp.now(),
      user: {
        _id: "CortexQ",
        name: "CortexQ",
        avatar:
          "https://gold-legislative-tuna-190.mypinata.cloud/ipfs/bafkreig4sc5zimeoqftn3i6danbeeoxegywjznhpzkmhqe4mwnd356rjhq",
      },
    };

    await messagesRef.add(message);
    await incrementRequestCount(session.user.id);

    return NextResponse.json({
      answer: message.text as string,
      searchQuery: optimizedQuery,
      originalProducts: originalResults,
      rerankedProducts: rerankedResults
    });
  } catch (e) {
    return NextResponse.json(
      {
        answer: "Sorry, there was an error processing your request.",
        error: "PROCESSING_ERROR",
      },
      { status: 500 }
    );
  }
}