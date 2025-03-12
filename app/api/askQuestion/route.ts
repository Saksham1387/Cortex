import adminDB from "@/firebase-admin";
import { NextApiResponse } from "next";
import admin from "firebase-admin";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generatePrompt, generateQueryPrompt } from "@/app/prompts";
import { checkRequestLimit, incrementRequestCount } from "@/lib/db";
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

// Number of previous messages to include as context
const MAX_CONTEXT_MESSAGES = 10;

export async function POST(request: Request, res: NextApiResponse) {
  try {
    const { prompt, chatId, session } = await request.json();

    // const hasQuotaRemaining = await checkRequestLimit(session.user.id);

    // if (!hasQuotaRemaining) {
    //   return NextResponse.json(
    //     {
    //       answer:
    //         "You've reached the maximum number of free requests. Please upgrade to premium to continue.",
    //       error: "QUOTA_EXCEEDED",
    //     },
    //     { status: 402 }
    //   ); // 402 Payment Required
    // }

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

    const queryPrompt = generateQueryPrompt(prompt, previousMessages);
    const queryResult = await model.generateContent([queryPrompt]);
    const optimizedQuery = queryResult.response.text().trim();

    console.log(optimizedQuery)
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
    const llmPrompt = generatePrompt(prompt, searchRes, previousMessages);
    const result = await model.generateContent([llmPrompt]);
    await messagesRef.add(userMessage);

    const message: Message = {
      text: result.response.text() || "Sorry, I don't understand",
      products: searchRes,
      createdAt: admin.firestore.Timestamp.now(),
      user: {
        _id: "SpaceGPT",
        name: "SpaceGPT",
        avatar:
          "https://gold-legislative-tuna-190.mypinata.cloud/ipfs/bafkreig4sc5zimeoqftn3i6danbeeoxegywjznhpzkmhqe4mwnd356rjhq",
      },
    };

    await messagesRef.add(message);
    await incrementRequestCount(session.user.id);

    return NextResponse.json({
      answer: message.text as string,
      searchQuery: optimizedQuery,
    });
  } catch (e) {
    console.error("Error processing request:", e);
    return NextResponse.json(
      {
        answer: "Sorry, there was an error processing your request.",
        error: "PROCESSING_ERROR",
      },
      { status: 500 }
    );
  }
}
