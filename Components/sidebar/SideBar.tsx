"use client";
import { useSession } from "next-auth/react";
import NewChatButton from "./NewChatButton";
import { signOut } from "next-auth/react";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";
import { collection, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import ChatRow from "../chat/ChatRow";


const SideBar = () => {
  const { data: session } = useSession();

  const [chats, loading, error] = useCollection(
    session &&
      query(
        collection(db, "users", session.user?.email!, "chats"),
        orderBy("createdAt", "asc")
      )
  );

  return (
    <div className="p-2 flex flex-col h-screen">
      <div className="flex-1">
        <div>
          <div className="flex flex-row ">
            <img src="/black-icon.png" className="h-10 w-10 mt-4 ml-2"></img>
            <p className="text-[30px] p-3 font-bold text-black">CortexQ</p>
          </div>
          {/* newchat */}
          <NewChatButton />
          <div>{/* modelselecetion */}</div>
          {/* map throught chat */}

          {chats?.docs.map((chat) => (
            <ChatRow key={chat.id} id={chat.id} />
          ))}
        </div>
      </div>
      <Drawer>
        <DrawerTrigger>
          {session && (
            <img
              src={session.user?.image!}
              alt="user"
              className="w-10 h-10 rounded-full cursor-pointer ml-2 mb-2 hover:opacity-50"
            ></img>
          )}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center">
              Do you want to Log Out?{" "}
            </DrawerTitle>
            <DrawerDescription className="text-center">
              This action cannot be undone.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button
              onClick={() => {
                signOut();
              }}
            >
              Yes
            </Button>
            <DrawerClose>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default SideBar;
