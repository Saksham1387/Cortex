import { RotateCw, Search } from "lucide-react";
import { Input } from "./ui/input";

export const FeedHeader = () => {
  return (
    <div className="container mx-auto p-4 font-serif flex flex-row justify-between">
      <div className="flex flex-row items-center justify-start gap-3">
        <h1 className="text-4xl font-bold">Feed</h1>
        <button>
          <RotateCw className="font-bold w-7 h-7" />{" "}
        </button>
      </div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Search className="h-4 w-4 text-gray-500" />
        </div>
        <Input
          placeholder="Find users by name"
          className="w-96 rounded-3xl pl-10 pr-5"  
        />
      </div>
    </div>
  );
};
