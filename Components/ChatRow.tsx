import  Link from "next/link"
import { exportTraceState } from "next/dist/trace"
import { ChatBubbleLeftIcon, TrashIcon } from "@heroicons/react/24/outline"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useCollection } from "react-firebase-hooks/firestore"
import { collection, deleteDoc, doc, orderBy, query } from "firebase/firestore"
import { db } from "@/firebase"

type Props = {
    id:String
  }

const truncate = (text:any, wordLimit:any) => {
    const words = text.split(" ");
    if (words.length <= wordLimit) {
        return text;
    }
    return words.slice(0, wordLimit).join(" ") + "...";
};

const ChatRow = ({id}:Props) =>{
    const Pathname = usePathname()
    const route = useRouter()
    const {data:session}    = useSession()
    const [active, setActive] = useState(false)

    const [messages] = useCollection(collection(db,"users",session?.user?.email!,"chats",id,"messages"))


    const deleteChat = async () =>{
        await deleteDoc(doc(db,"users",session?.user?.email!,"chats",id))
        route.replace("/")
    }
    useEffect(()=>{
        if(!Pathname) return;

        setActive(Pathname.includes(id))
    },[Pathname])
    return(
        <Link
        href={`/chat/${id}`}
        className={`chat-row bg-slate-600 justify-center mt-3 ${active && 'bg-gray-900'}`}
        >
            <ChatBubbleLeftIcon className="h-5 w-5"></ChatBubbleLeftIcon>
            <p className="flex-1  hidden md:inline-flex truncate text-white">
            {truncate(messages?.docs[messages?.docs.length - 1]?.data().text || "New Chat", 3)}
            </p>
            <TrashIcon onClick={deleteChat} className="h-5 w-5 text-slate-500    hover:text-red-700"></TrashIcon>
        </Link>
    )
}
export default ChatRow;