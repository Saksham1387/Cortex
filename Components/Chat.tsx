// "use client";
// import { db } from "@/firebase";
// import { collection, orderBy, query } from "firebase/firestore";
// import { useSession } from "next-auth/react";
// import { useCollection } from "react-firebase-hooks/firestore";
// import { useEffect, useRef } from "react";
// import Message from "./Message";
// import { ArrowDownIcon } from "@heroicons/react/24/outline";

// type Props = {
//   chatId: string;
// };

// const Chat = ({ chatId }: Props) => {
//   const { data: session } = useSession();
//   const [messages] = useCollection(
//     session &&
//       query(
//         collection(
//           db,
//           "users",
//           session?.user?.email!,
//           "chats",
//           chatId,
//           "messages"
//         ),
//         orderBy("createdAt", "asc")
//       )
//   );

//   const chatEndRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (chatEndRef.current) {
//       chatEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   console.log("messages:", messages?.docs);

//   return (
//     <div className="flex-1 overflow-y-auto overflow-x-hidden">
//       {messages?.empty && (
//         <>
//           <p className="mt-10 text-center text-white font-light">
//             Ask Your Question below
//           </p>
//           <ArrowDownIcon className="h-5 w-5 mx-auto mt-5 text-white animate-bounce" />
//         </>
//       )}
//       {messages?.docs.map((message) => (
//         <Message key={message.id} message={message.data()} />
//       ))}
//       <div ref={chatEndRef}></div>
//     </div>
//   );
// };

// export default Chat;


"use client";
import { db } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useEffect, useRef } from "react";
import Message from "./Message";
import { ArrowDownIcon } from "@heroicons/react/24/outline";

type Props = {
  chatId: string;
};

const MessageSkeleton = () => (
  <div className="items-center flex justify-center mt-3 animate-pulse">
    <div className="py-5 rounded-xl max-w-[700px] w-full p-5 bg-gray-800/50">
      <div className="flex space-x-5 pt-5 max-w-2xl mx-auto">
        <div className="h-8 w-8 rounded-full bg-gray-600"></div>
        <div className="w-full">
          <div className="h-4 bg-gray-600 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-600 rounded w-1/2 mb-1"></div>
          <div className="h-4 bg-gray-600 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  </div>
);

const ProductsSkeleton = () => (
  <div className="items-center flex justify-center mt-8 animate-pulse">
    <div className="rounded-xl max-w-[700px] w-full p-5">
      <div className="flex justify-between items-center mb-3">
        <div className="h-6 bg-gray-600 rounded w-48"></div>
        <div className="h-6 bg-gray-600 rounded w-32"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="h-64 bg-gray-700"></div>
            <div className="p-3">
              <div className="h-4 bg-gray-600 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-3"></div>
              <div className="h-5 bg-gray-600 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-600 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Chat = ({ chatId }: Props) => {
  const { data: session } = useSession();
  const [messages, loading, error] = useCollection(
    session &&
      query(
        collection(
          db,
          "users",
          session?.user?.email!,
          "chats",
          chatId,
          "messages"
        ),
        orderBy("createdAt", "asc")
      )
  );

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  console.log("messages:", messages?.docs);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      {loading && (
        <>
          <MessageSkeleton />
          <MessageSkeleton />
          <ProductsSkeleton />
        </>
      )}
      
      {error && (
        <p className="mt-10 text-center text-red-500">
          Error loading messages: {error.message}
        </p>
      )}
      
      {messages?.empty && !loading && (
        <>
          <p className="mt-10 text-center text-white font-light">
            Ask Your Question below
          </p>
          <ArrowDownIcon className="h-5 w-5 mx-auto mt-5 text-white animate-bounce" />
        </>
      )}
      
      {messages?.docs.map((message) => (
        <Message key={message.id} message={message.data()} />
      ))}
      
      <div ref={chatEndRef}></div>
    </div>
  );
};

export default Chat;