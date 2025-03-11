import { ProfileHeader } from "@/components/ProfileHeader";
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
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <ProfileHeader user={user as IUser} />
    </div>
  );
}
