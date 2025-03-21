"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  addDoc,
  collection,
  orderBy,
  query,
  serverTimestamp,
} from "@firebase/firestore";
import { db } from "@/firebase";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";
import { LogOutIcon, PlusCircleIcon } from "lucide-react";
import ChatRow from "../chat/ChatRow";
import { Separator } from "../ui/separator";

const DRAWER_WIDTH = 250;

export function HistoryDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchString, setSearchString] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  const [chats, loading, error] = useCollection(
    session &&
      query(
        collection(db, "users", session.user?.email!, "chats"),
        orderBy("createdAt", "desc") // Changed from "asc" to "desc" to show latest chats first
      )
  );

  const handleNewChat = async () => {
    const doc = await addDoc(
      collection(db, "users", session?.user?.email!, "chats"),
      {
        id: session?.user?.email,
        createdAt: serverTimestamp(),
      }
    );

    router.push(`/chat/${doc.id}`);

    setIsOpen(false);
  };

  useEffect(() => {
    // Track mouse pointer, open if it's on the left over the drawer
    const handleMouseMove = (e:any) => {
      if (e.clientX < 40) {
        setIsOpen(true);
      }
      if (e.clientX > DRAWER_WIDTH) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="left">
      <DrawerContent
        style={{ maxWidth: DRAWER_WIDTH, height: "91.5vh" }}
        className="bg-stone-100 flex flex-col border"
      >
        <DrawerHeader className="p-4 space-y-4">
          <div className="pt-2 font-serif text-lg">Search History</div>
          <Button
            onClick={handleNewChat}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <PlusCircleIcon size={18} />
            <span>New Chat</span>
          </Button>
          <div className="overflow-y-auto flex-1 mt-2">
            {loading && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading chats...
              </p>
            )}

            {error && (
              <p className="text-sm text-red-500 text-center py-4">
                Error loading chats
              </p>
            )}

            {!loading && chats?.empty && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No chats yet. Start a new conversation!
              </p>
            )}

            <div className="space-y-1">
              {chats?.docs
                .filter((chat) => {
                  // Filter by search string if present
                  if (!searchString) return true;
                  return chat.id
                    .toLowerCase()
                    .includes(searchString.toLowerCase());
                })
                .map((chat) => (
                  <ChatRow key={chat.id} id={chat.id} />
                ))}
            </div>
          </div>
        </DrawerHeader>

        <DrawerFooter className="mt-auto p-4 pt-0">
          <Separator />
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 text-black "
          >
            <LogOutIcon size={18} />
            <span>Logout</span>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}