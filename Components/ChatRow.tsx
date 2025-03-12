import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { MessageSquare, Trash2 } from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore";

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
  const [isLoading, setIsLoading] = useState(false);

  const [messages] = useCollection(
    collection(db, "users", session?.user?.email!, "chats", id, "messages")
  );
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

  return (
    <Link
      href={`/chat/${id}`}
      className={`
        flex items-center space-x-2 px-3 py-2 rounded-md text-sm
         transition-colors duration-200
        ${
          active
            ? "bg-stone-200 text-black"
            : "bg-white hover:bg-stone-300 text-black"
        }
        ${isLoading ? "opacity-70" : ""}
      `}
    >
      <MessageSquare size={16} className="flex-shrink-0" />

      <p className="flex-1 truncate">
        {truncate(
          messages?.docs[messages?.docs.length - 1]?.data().text || "New Chat",
          4
        )}
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
