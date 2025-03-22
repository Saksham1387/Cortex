"use client";

import Chat from "@/components/chat/Chat";
import ChatInput from "@/components/chat/ChatInput";
import { useState } from "react";

type Props = {
  params: {
    id: string;
  };
};

const Chatpage = ({ params: { id } }: Props) => {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col h-screen w-full bg-[#fafafa] pt-10">
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
