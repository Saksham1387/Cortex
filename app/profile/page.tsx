
import { Favorites } from "@/components/Favrouties";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      <ProfileHeader user={user as IUser} />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Input type="text" placeholder="Search favorites..." className="w-full rounded-full" />
        </div>
        <Button variant="outline" className="gap-1 whitespace-nowrap">
          <span>+</span> Tag
        </Button>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium">7 items</h2>
        <Select defaultValue="recent">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort results by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Favorites/>
    </div>
  );
}
