"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IUser } from "@/types/user";
import { Instagram, InstagramIcon, PenSquare, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import axios from "axios";

interface IProfileProps {
  user: IUser;
}
export const ProfileHeader = ({ user }: IProfileProps) => {
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [instagram, setInstagram] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUserUpdate = async () => {
    setLoading(true);
    try {
      const res = await axios.patch("/api/user", {
        instagramId: instagram,
      });
      if (res.status === 200) {
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleShare = () => {
    console.log("here");
    if (navigator.share) {
      navigator
        .share({
          title: user.name,
          url: `${window.location.href}/${user.id}`,
        })
        .catch((err) => console.error("Error sharing:", err));
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
      } else {
        console.error("Sharing and clipboard APIs not available");
      }
    }
  };

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
      <div className="flex items-center gap-4 flex-col">
        <TooltipProvider>
          <Tooltip open={showShareTooltip}>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleShare}>
                <Share2 size={16} className="mr-2" />
                Share
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Link copied!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {user.instagramId ? (
          <a
            href={`https://instagram.com/${user.instagramId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Instagram className="h-5 w-5" />
            {user.instagramId ? user.instagramId : "Add Instagram"}
          </a>
        ) : (
          <Dialog>
            <DialogTrigger className="border p-2 text-sm rounded-md hover:bg-gray/90">
              <div className="flex flex-row gap-2 justify-center items-center px-3">
                Add <InstagramIcon className="w-5 h-5 " />
              </div>
            </DialogTrigger>
            <DialogContent className="font-serif max-w-sm p-6">
              <DialogHeader>
                <DialogTitle className="text-thin text-center">
                  Connect Instagram
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    placeholder="example"
                    className="px-3 py-2"
                    value={user.name}
                  ></Input>
                </div>
                <div className="space-y-2">
                  <Label>Instagram Handle</Label>
                  <Input
                    placeholder="@example"
                    className="px-3 py-2"
                    value={user.instagramId ? user.instagramId : instagram}
                    onChange={(e) => {
                      setInstagram(e.target.value);
                    }}
                  ></Input>
                </div>
                <div className="flex items-center justify-center">
                  <Button onClick={handleUserUpdate} disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};
