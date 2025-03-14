"use client";
import { ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { GiClothes } from "react-icons/gi";
import { useDeferredValue, useEffect, useRef, useState, useCallback } from "react";
import Loader from "../loader";

const SkeletonSuggestion = () => (
  <div className="text-sm select-none py-3 px-4 border-b border-gray-100 last:border-b-0 flex items-center animate-pulse">
    <div className="h-4 w-4 bg-gray-200 rounded mr-2 flex-shrink-0"></div>
    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
  </div>
);



export function SearchBar() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const deferredInput = useDeferredValue(input);
  const [suggestions, setSuggestions] = useState([]);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounced fetch suggestions function
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    
    try {
      setIsDebouncing(false);
      const response = await fetch(`/api/autoComplete?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  }, []);

  // Implement debouncing on input change
  useEffect(() => {
    if (deferredInput === "") {
      setSuggestions([]);
      return;
    }
    
    setIsDebouncing(true);
    
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set a new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(deferredInput);
    }, 300); // 300ms debounce delay
    
    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [deferredInput, fetchSuggestions]);
  
  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        resultsContainerRef.current &&
        !resultsContainerRef.current.contains(e.target as Node)
      ) {
        setSuggestions([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const doc = await addDoc(
        collection(db, "users", session?.user?.email!, "chats"),
        {
          id: session?.user?.email,
          createdAt: serverTimestamp(),
        }
      );

      await fetch("/api/askQuestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: input,
          chatId: doc.id,
          session,
        }),
      });
      
      router.push(`/chat/${doc.id}`);
    } catch (error) {
      console.error("Error submitting search:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-2xl">
      {loading ? (
        <div className="py-3 flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="relative w-full max-w-2xl">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <GiClothes className="h-6 w-6 text-muted-foreground" />
          </div>
          <form onSubmit={handleSubmit}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pl-10 pr-10 py-6 rounded-full border-2 text-base 
                focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
              placeholder="Try 'good hiking shoes?'"
              aria-label="Search"
              autoComplete="off"
            />
            <Button
              size="icon"
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 bg-gray-200 hover:bg-gray-300 text-gray-700"
              disabled={!input.trim()}
              aria-label="Search"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </form>
          
          {suggestions.length > 0 && (
            <div 
              className="absolute top-14 left-0 z-20 w-full rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-200 ease-in-out"
              ref={resultsContainerRef}
            >
              {isDebouncing && (
                <SkeletonSuggestion/>
              )}
              <div className="max-h-64 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion}-${index}`}
                    className="text-sm cursor-pointer select-none relative py-3 px-4 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 flex items-center"
                    onClick={() => setInput(suggestion)}
                  >
                    <GiClothes className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}