"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IUser } from "@/types/user";
import { Instagram, InstagramIcon, PenSquare, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";


interface IProfileProps {
  initialUser: IUser; 
}

export const ProfileHeader = ({ initialUser }: IProfileProps) => {
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", initialUser.id],
    queryFn: async () => initialUser,
    initialData: initialUser,
    staleTime: Infinity,
  });

  const [editFormData, setEditFormData] = useState({
    name: initialUser.name || "",
    bio: initialUser.bio || "",
    instagramId: initialUser.instagramId || "",
    image: initialUser.image || "",
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<IUser>) => {
      const res = await axios.patch("/api/user", userData);
      return res.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["user", initialUser.id], (oldData: IUser) => {
        return { ...oldData, ...updatedUser };
      });

      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error updating user:", error);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserUpdate = () => {
    updateUserMutation.mutate(editFormData);
  };

  const handleShare = () => {
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
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <PenSquare className="h-4 w-4" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="font-serif max-w-md p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl text-center">
                    Edit Profile
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      className="px-3 py-2"
                      value={editFormData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell people about yourself"
                      className="px-3 py-2 min-h-24"
                      value={editFormData.bio}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagramId">Instagram Handle</Label>
                    <Input
                      id="instagramId"
                      name="instagramId"
                      placeholder="@example"
                      className="px-3 py-2"
                      value={editFormData.instagramId}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Profile Image URL</Label>
                    <Input
                      id="image"
                      name="image"
                      placeholder="https://example.com/image.jpg"
                      className="px-3 py-2"
                      value={editFormData.image}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUserUpdate}
                      disabled={updateUserMutation.isPending}
                    >
                      {updateUserMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
            {user.bio ? (
              <>
                {showFullBio ? user.bio : `${user.bio.slice(0, 70)}...`}
                {user.bio.length > 70 && (
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
            <span>{user.followers.length} followers</span>
            <span>{user.following.length} following</span>
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
        {user.instagramId ? (
          <a
            href={`https://instagram.com/${user.instagramId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Instagram className="h-5 w-5" />
            {user.instagramId}
          </a>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              setIsEditDialogOpen(true);
              // Focus on Instagram field after a short delay to allow dialog to open
              setTimeout(() => {
                const instagramInput = document.getElementById("instagramId");
                if (instagramInput) {
                  instagramInput.focus();
                }
              }, 100);
            }}
          >
            <InstagramIcon className="h-4 w-4" />
            Add Instagram
          </Button>
        )}
      </div>
    </div>
  );
};
