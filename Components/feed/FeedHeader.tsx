import { RotateCw, Search } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllUsers } from "@/lib/db";
import { UserSearch } from "../UserSearch";


export const FeedHeader = async () => {
    const session = await getServerSession(authOptions);
    const users = await getAllUsers(session?.user.id!);
  return (
    <div className="container mx-auto p-4 font-serif flex flex-row justify-between">
      <div className="flex flex-row items-center justify-start gap-3">
        <h1 className="text-4xl font-bold">Feed</h1>
        <button>
          <RotateCw className="font-bold w-7 h-7" />{" "}
        </button>
      </div>
      <UserSearch users={users}/>
    </div>
  );
};
