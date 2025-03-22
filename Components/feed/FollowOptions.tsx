"use client"

import Image from "next/image";
import { Button } from "../ui/button";


export const FollowOptions = (users:any) => {
  if (!users) return null;

  return (
    <div className="container mx-auto p-4 font-serif">
      <h1 className="text-lg font-light text-gray-500 mb-6">Get Inspired By</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
        {users.users.map((user:any, index:number) => (
          <div
            key={index}
            className="flex flex-col gap-2 items-center justify-center w-full"
          >
            <div className="relative">
              <Image
                src={user.image!}
                alt={user.name!}
                className="rounded-full h-16 w-16 object-cover"
                width={64}
                height={64}
              />
            </div>
            <p className="text-sm font-medium">@{user.name}</p>
            {/* <p className="text-xs text-gray-500">{user.likes || 0} likes</p> */}
            <Button 
              variant="outline" 
              className="text-xs py-1 px-4 rounded-full"
              size="sm"
            >
              + Follow
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};