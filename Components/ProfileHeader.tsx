import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IUser } from "@/types/user";
import { Instagram, PenSquare, Share2 } from "lucide-react";
import Image from "next/image";

interface IProfileProps {
  user: IUser;
}
export const ProfileHeader = ({ user }: IProfileProps) => {
  return (
    <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
      <div className="flex items-center gap-6">
        <Avatar className="h-28 w-28 bg-gradient-to-br from-blue-200 to-green-200 flex items-center justify-center">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={100}
              height={100}
              className="rounded-full object-cover"
            />
          ) : (
            <AvatarFallback className="text-3xl font-semibold">
              {user.name.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-medium">{user.name}</h1>
            <Button variant="outline" size="sm" className="gap-2">
              <PenSquare className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
          <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
            {user.bio ? `${user.bio?.slice(0, 70)}...` : null}
          </div>
          <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
            <span>{user.followers.length} followers</span>
            <span>{user.following.length} following</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="default" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <a
          href="https://instagram.com/s.akshm"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Instagram className="h-5 w-5" />
          s.akshm
        </a>
      </div>
    </div>
  );
};
