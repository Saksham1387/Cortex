"use client";
import { ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { GiClothes } from "react-icons/gi";
import { useState } from "react";
import Loader from "../loader";

export function SearchBar() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    const doc = await addDoc(
      collection(db, "users", session?.user?.email!, "chats"),
      {
        id: session?.user?.email,
        createdAt: serverTimestamp(),
      }
    );

    await fetch("/api/askQuestion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: input,
        chatId: doc.id,
        session,
      }),
    }).then(() => {
      router.push(`/chat/${doc.id}`);
      setLoading(false);
    });
  };

  return (
    <div className="relative w-full max-w-2xl">
      {loading ? (
        <div className="py-3 flex items-center justify-center">
          <Loader/>
        </div>
      ) : (
        <div className="relative w-full max-w-2xl">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <GiClothes className="h-6 w-6 text-muted-foreground" />
          </div>
          <form action="" onSubmit={handleSubmit}>
          <Input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            className="pl-10 pr-10 py-6 rounded-full border-2 text-base 
                focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
            placeholder="Try 'good hiking shoes?'"
          />
          <Button
            size="icon"
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          </form>
        </div>
      )}
    </div>
  );
}
