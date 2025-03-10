import adminDB from "@/firebase-admin";
import { NextApiResponse } from "next";
import admin from "firebase-admin";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generatePrompt, generateQueryPrompt } from "@/app/prompts";
const SerpApi = require("google-search-results-nodejs");
const { getJson } = require("serpapi");

type Message = {
  text: string;
  products?: any;
  createdAt: admin.firestore.Timestamp;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
};

const client = new GoogleGenerativeAI(process.env.GEMINI_API || "");
const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

const search = new SerpApi.GoogleSearch();
// Number of previous messages to include as context
const MAX_CONTEXT_MESSAGES = 10;

export async function POST(request: Request, res: NextApiResponse) {
  const { prompt, chatId, session } = await request.json();

  // Create the user message
  const userMessage: Message = {
    text: prompt,
    createdAt: admin.firestore.Timestamp.now(),
    user: {
      _id: session.user.email,
      name: session.user.name,
      avatar: session.user.image,
    },
  };

  // Fetch previous messages for context
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

  // Reverse to get chronological order
  previousMessages.reverse();

  // First, generate an optimized search query using the LLM
  const queryPrompt = generateQueryPrompt(prompt, previousMessages);
  const queryResult = await model.generateContent([queryPrompt]);
  const optimizedQuery = queryResult.response.text().trim();

  console.log(optimizedQuery);
  // Use the optimized query for SerpAPI
  const searchPromise = new Promise((resolve, reject) => {
    getJson(
      {
        engine: "google_shopping",
        q: optimizedQuery,
        location: "India",
        api_key: process.env.SERP_API,
      },
      (json: any) => {
        resolve(json["shopping_results"]);
      }
    );
  });

  const searchRes = await searchPromise;

  console.log(searchRes);

  // Generate prompt with context
  const llmPrompt = generatePrompt(prompt, searchRes, previousMessages);

  // Generate response with context-aware prompt
  const result = await model.generateContent([llmPrompt]);

  // Save the user message first
  await messagesRef.add(userMessage);

  // Create and save the AI response
  const message: Message = {
    text: result.response.text() || "Sorry, I don't understand",
    products: searchRes, // Store the search results
    createdAt: admin.firestore.Timestamp.now(),
    user: {
      _id: "SpaceGPT",
      name: "SpaceGPT",
      avatar: "https://ui-avatars.com/api/?name=AI",
    },
  };

  await messagesRef.add(message);

  return NextResponse.json({
    answer: message.text as string,
    searchQuery: optimizedQuery, // Return the optimized query for debugging
  });
}
