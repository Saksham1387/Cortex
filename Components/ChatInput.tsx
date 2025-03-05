"use client"
import { db } from "@/firebase";
import { PaperAirplaneIcon } from "@heroicons/react/16/solid";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { text } from "stream/consumers";

type Props = {
    chatId:string;
}
const ChatInput = ({chatId} :Props) =>{
    const {data:session} = useSession();
    const [prompt, setPrompt] = useState("")
    console.log(prompt)

    const sendMessage = async (e:FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        if(!prompt) return ;
        const input = prompt.trim();
        setPrompt("");
        console.log("input:", input);
        const message:Message = {
            text:input,
            createdAt: serverTimestamp(),
            user:{
                _id:session?.user?.email!,
                name:session?.user?.name!,
                avatar:session?.user?.image! || `https://ui-avatars.com/api/?name=${session?.user?.name}`
            }
        }

        // await addDoc(collection(db,"users",session?.user?.email!,"chats",chatId,"messages"),
        // message)
        console.log("db:", db);
        console.log("user email:", session?.user?.email!);
        console.log("chatId:", chatId);
        // await addDoc(
        //     collection(db,'users',session?.user?.email!,'chats',chatId,'messages'),{
        //     message
        // })

        const notification = toast.loading("Sending Message")
        console.log("control here")
        await fetch("/api/askQuestion",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                prompt: input,chatId,session 
            })
        }).then((res)=>{
            toast.success("Message Sent",{
                id:notification,
            })
        })

    }
    return(
        <div className="flex items-center justify-center mb-3">
        <div className="bg-gray-700/50 text-white text-sm rounded-full w-[600px] flex justify-center items-center h-[58px]">
            <form onSubmit={sendMessage} className="p-5 space-x-5 flex-1 ml-10 flex-col">
                <input disabled={!session} className=" w-[400px] focus:outline-none bg-transparent flex-1 disabled:cursor-not-allowed disabled:text-gray-300" value={prompt} onChange={(e)=>{setPrompt(e.target.value)}} type="text" placeholder="Type your message here..."></input>
                <button 
                disabled={!session || prompt.length === 0} 
                className="bg-[white] hover:opacity-50 text-black font-bold px-2 py-2 rounded "
                type="submit">
                    <PaperAirplaneIcon className="h-4 w-4 -rotate-45"></PaperAirplaneIcon>
                </button>
            </form>
        </div>
        </div>
    )
}
export default ChatInput;