import Chat from "@/Components/Chat";
import ChatInput from "@/Components/ChatInput";

type Props = {
  params: {
    id: string;
  };
};

const Chatpage = ({ params: { id } }: Props) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Chat chatId={id}></Chat>
      <ChatInput chatId={id}></ChatInput>
    </div>
  );
};

export default Chatpage;
