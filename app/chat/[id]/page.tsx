"use client";
import Chat from "@/components/Chat";
import ChatInput from "@/components/ChatInput";
import { useState } from "react";

type Props = {
  params: {
    id: string;
  };
};

const Chatpage = ({ params: { id } }: Props) => {
  const [loading, setLoading] = useState(false);
  console.log(loading);
  return (
    <div className="flex flex-col h-screen w-full bg-[#fafafa]">
      <div className="pb-28">
        <Chat chatId={id} loading={loading}></Chat>
      </div>
      <div>
        <ChatInput
          chatId={id}
          loading={loading}
          setLoading={setLoading}
        ></ChatInput>
      </div>
    </div>
  );
};

export default Chatpage;
