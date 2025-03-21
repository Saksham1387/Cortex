"use client";
import { serverTimestamp } from "firebase/firestore";
import { ArrowUp, MessageCircle, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  chatId: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

const ChatInput = ({ chatId, loading, setLoading }: Props) => {
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState("");

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    setLoading(true)
    e.preventDefault();
    if (!prompt) return;
    const input = prompt.trim();
    setPrompt("");

    const message = {
      text: input,
      createdAt: serverTimestamp(),
      user: {
        _id: session?.user?.email!,
        name: session?.user?.name!,
        avatar:
          session?.user?.image! ||
          `https://ui-avatars.com/api/?name=${session?.user?.name}`,
      },
    };

    const notification = toast.loading("Sending Message");
    await fetch("/api/askQuestion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: input,
        chatId,
        session,
      }),
    }).then(() => {
      setLoading(false)
      toast.success("Message Sent", {
        id: notification,
      });
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4">
      <div className="flex items-center justify-center mb-3">
        <div className="bg-white rounded-full w-[800px] flex justify-center items-center h-[58px] relative border border-gray-200 shadow-xl">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <MessageCircle className="w-5 h-5 text-gray-500" />
          </div>
          <form
            onSubmit={sendMessage}
            className="flex items-center w-full px-5 "
          >
            <input
              disabled={!session}
              className="w-full max-w-[700px] pl-6 focus:outline-none bg-transparent flex-1 font-normal text-sm disabled:cursor-not-allowed disabled:text-gray-300 sticky"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              type="text"
              placeholder="Add a follow-up or refine your search"
            />
            <div className="flex items-center gap-2 ml-3">
              <button
                disabled={!session || prompt.length === 0 || loading}
                className="bg-transparent text-black p-2 rounded-full transition-all disabled:opacity-50"
                type="submit"
              >
                <Send className="h-4 w-4 cursor-pointer hover:bg-white" />
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="absolute bottom-4 right-20">
        <button className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-all">
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;