import { db } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { PlusIcon } from "@heroicons/react/16/solid";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";



const NewChatButton = () =>{
    const route = useRouter()
    const {data: session } = useSession();

    const createChat = async () =>{
        const doc = await addDoc(
            collection(db,"users",session?.user?.email!,"chats"),{
            id:session?.user?.email,
            createdAt: serverTimestamp()
        })

        route.push(`/chat/${doc.id}`)

    }
    return (
        <Button variant="secondary"onClick={createChat} className="text-white rounded-xl w-full bg-black ">
            <PlusIcon className="h-4 w-4"></PlusIcon>
            <p>New Chat</p>
        </Button>
    )
}
export default NewChatButton;