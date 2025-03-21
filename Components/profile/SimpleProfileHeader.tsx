"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IUser } from "@/types/user";
import { Instagram, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface IProfileProps {
  initialUser: IUser;
}

export const SimpleProfileHeader = ({ initialUser }: IProfileProps) => {
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: initialUser.name,
          url: `${window.location.href}/${initialUser.id}`,
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
          {initialUser.image ? (
            <Image
              src={initialUser.image}
              alt={initialUser.name}
              width={100}
              height={100}
              className="rounded-full object-cover"
            />
          ) : (
            <AvatarFallback className="text-3xl font-semibold">
              {initialUser.name.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-medium">{initialUser.name}</h1>
          </div>
          <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
            {initialUser.bio ? (
              <>
                {showFullBio ? initialUser.bio : `${initialUser.bio.slice(0, 70)}...`}
                {initialUser.bio.length > 70 && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="text-gray-500 text-xs"
                  >
                    {showFullBio ? "View Less" : "View More"}
                  </button>
                )}
              </>
            ) : null}
          </div>
          <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
            <span>{initialUser.followers.length} followers</span>
            <span>{initialUser.following.length} following</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-col">
        <TooltipProvider>
          <Tooltip open={showShareTooltip}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={handleShare}
                className="bg-black text-white hover:bg-black hover:text-white"
              >
                <Share2 size={16} className="mr-2" />
                Share
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Link copied!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {initialUser.instagramId && (
          <a
            href={`https://instagram.com/${initialUser.instagramId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Instagram className="h-5 w-5" />
            {initialUser.instagramId}
          </a>
        )}
      </div>
    </div>
  );
};