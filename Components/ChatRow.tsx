import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { MessageSquare, Trash2 } from "lucide-react";

type Props = {
  id: string;
};

const truncate = (text: string, wordLimit: number) => {
  if (!text) return "New Chat";
  
  const words = text.split(" ");
  if (words.length <= wordLimit) {
    return text;
  }
  return words.slice(0, wordLimit).join(" ") + "...";
};

const ChatRow = ({ id }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [active, setActive] = useState(false);
  const [lastMessage, setLastMessage] = useState("New Chat");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLastMessage = async () => {
      if (!session?.user?.email) return;
      
      setIsLoading(true);
      try {
        const chatDoc = await getDoc(doc(db, "users", session.user.email, "chats", id));
        
        if (chatDoc.exists() && chatDoc.data().lastMessage) {
          setLastMessage(chatDoc.data().lastMessage);
        }
      } catch (error) {
        console.error("Error fetching last message:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLastMessage();
  }, [id, session]);

  const deleteChat = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (session?.user?.email) {
      await deleteDoc(doc(db, "users", session.user.email, "chats", id));
      
      if (pathname?.includes(id)) {
        router.replace("/");
      }
    }
  };

  useEffect(() => {
    if (!pathname) return;
    setActive(pathname.includes(id));
  }, [pathname, id]);

  console.log("link----",id)
  return (
    <Link
      href={`/chat/${id}`}
      className={`
        flex items-center space-x-2 px-3 py-2 rounded-md text-sm
         transition-colors duration-200
        ${active ? "bg-stone-200 text-black" : "bg-white hover:bg-stone-300 text-black"}
        ${isLoading ? "opacity-70" : ""}
      `}
    >
      <MessageSquare size={16} className="flex-shrink-0" />
      
      <p className="flex-1 truncate">
        {truncate(lastMessage, 4)}
      </p>
      
      <button 
        onClick={deleteChat}
        className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </Link>
  );
};

export default ChatRow;