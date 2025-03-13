import { Favorites } from "@/components/Favrouties";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Input } from "@/components/ui/input";
import { authOptions } from "@/lib/auth";
import { getUser } from "@/lib/db";
import { IUser } from "@/types/user";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Profile() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth");
  }
  const user = await getUser(session?.user.id);
  return (
    <div className="container mx-auto max-w-6xl px-4 pt-28">
      <ProfileHeader initialUser={user as IUser}/>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 px-5">
          <Input
            type="text"
            placeholder="Search favorites..."
            className="w-full rounded-full"
          />
        </div>
      </div>
      <Favorites />
    </div>
  );
}
