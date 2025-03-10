"use client"
import { Mail, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

export function SearchBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const handleSubmit = async () => {
    const doc = await addDoc(
      collection(db, "users", session?.user?.email!, "chats"),
      {
        id: session?.user?.email,
        createdAt: serverTimestamp(),
      }
    );

    router.push(`/chat/${doc.id}`);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <Mail className="h-5 w-5 text-muted-foreground" />
      </div>
      <Input
        className="pl-10 pr-10 py-6 rounded-full border-2 text-base 
             focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
        placeholder="Try 'good hiking shoes?'"
      />
      <Button
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 bg-gray-200 hover:bg-gray-300 text-gray-700"
        onClick={handleSubmit}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  );
}
