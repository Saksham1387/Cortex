import Chat from "@/components/Chat";
import ChatInput from "@/components/ChatInput";

type Props = {
  params: {
    id: string;
  };
};

const Chatpage = ({ params: { id } }: Props) => {
  return (
    <div className="flex flex-col h-screen w-full bg-[#fafafa]">
      <Chat chatId={id}></Chat>

      <ChatInput chatId={id}></ChatInput>
    </div>
  );
};

export default Chatpage;
