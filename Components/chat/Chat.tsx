"use client";
import { db } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useEffect, useRef } from "react";
import Message from "./Message"; // Make sure this imports your newly created Message component
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { MessageSkeleton, ProductsSkeleton } from "../skeletons/chat";
import ThinkingAnimation from "../ThinkingAnimation";

type Props = {
  chatId: string;
  loading: boolean;
};

const Chat = ({ chatId, loading }: Props) => {
  const { data: session } = useSession();
  const [messages, fetching, error] = useCollection(
    session &&
      query(
        collection(
          db,
          "users",
          session?.user?.email!,
          "chats",
          chatId,
          "messages"
        ),
        orderBy("createdAt", "asc")
      )
  );

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      {fetching && (
        <>
          <MessageSkeleton />
          <MessageSkeleton />
          <ProductsSkeleton />
        </>
      )}

      {error && (
        <p className="mt-10 text-center text-red-500">
          Error loading messages: {error.message}
        </p>
      )}

      {messages?.empty && !fetching && (
        <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto px-4 py-8 text-black font-serif">
          <div className="rounded-lg p-6 text-center w-full">
            <h3 className="text-xl font-semibold text-black mb-4">
              Start a new conversation
            </h3>
            <p className="text-black mb-6">
              Ask us anything about our latest collections, inventory
              availability, or fashion trends!
            </p>
          </div>
          <ArrowDownIcon className="h-8 w-8 mt-8 text-white animate-bounce" />
        </div>
      )}

      {messages?.docs.map((message) => (
        <Message key={message.id} message={message.data()} />
      ))}

      {loading ? <ThinkingAnimation /> : null}

      <div ref={chatEndRef}></div>
    </div>
  );
};

export default Chat;
