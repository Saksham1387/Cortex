"use client";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <header className="fixed w-full border-b bg-[#fafafa] mb-10  z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-serif text-xl font-medium">
          CortexQ
        </Link>

        <nav className="flex items-center gap-6">
        <Link href="/feed" className="text-sm font-medium">
            Feed
          </Link>
          <Link href="/pricing" className="text-sm font-medium">
            Pricing
          </Link>
          <Link href="/community" className="text-sm font-medium">
            Community
          </Link>

          {!session ? (
            <span>
              <Link
                href={"/auth"}
                className="bg-black text-white hover:bg-black/90 p-3 rounded-xl text-sm"
              >
                Sign Up
              </Link>
            </span>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger>
                {session && (
                  <Image
                    src={session.user.image || ""}
                    alt="user"
                    width={100}
                    height={100}
                    className="w-10 h-10 rounded-full cursor-pointer ml-2 mb-2"
                  />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>
                  <div className="font-normal">{session?.user?.name}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div>
                    <button
                      onClick={() => {
                        router.push("/profile");
                      }}
                    >
                      Profile
                    </button>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div>
                    <button
                      onClick={() => {
                        signOut();
                      }}
                    >
                      LogOut
                    </button>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  );
}
