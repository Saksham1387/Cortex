"use client";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import Fuse from "fuse.js";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const UserSearch = (users: any) => {
  const [input, setInput] = useState("");
  const [searchUsers, setSearchUsers] = useState<any[]>([]);
  const deferredInput = useDeferredValue(input);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const fuseRef = useRef<Fuse<any> | null>(null);
  const router = useRouter();

  useEffect(() => {
    fuseRef.current = new Fuse(users.users, {
      keys: ["name"],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [users]);

  useEffect(() => {
    if (!fuseRef.current) return;

    if (deferredInput.length > 0) {
      const results = fuseRef.current.search(deferredInput);
      setSearchUsers(results.map((result) => result.item));
    } else {
      setSearchUsers([]);
    }
  }, [deferredInput]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        resultsContainerRef.current &&
        !resultsContainerRef.current.contains(e.target as Node)
      ) {
        setSearchUsers([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <Search className="h-4 w-4 text-gray-500" />
      </div>
      <Input
        placeholder="Find users by name"
        className="w-96 rounded-3xl pl-10 pr-5 focus:ring-0 "
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
      />

      {searchUsers.length > 0 && (
        <div
          ref={resultsContainerRef}
          className="absolute z-10 mt-1 w-full bg-white max-h-72 overflow-y-auto border-gray-200 border rounded-lg"
        >
          {searchUsers.map((user, index) => (
            <div
              key={user.id}
              className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-100`}
              onClick={() => {
                // Handle user selection here
                router.push(`/profile/${user.id}`);
                setInput("");
                setSearchUsers([]);
              }}
            >
              {user.image && (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={100}
                  height={100}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <div className="flex flex-col">
                <span className="font-normal text-sm">{user.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
