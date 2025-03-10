"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#fafafa]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-serif text-xl font-medium">
          CortexQ
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/pricing" className="text-sm font-medium">
            Pricing
          </Link>
          <Link href="/community" className="text-sm font-medium">
            Community
          </Link>

          <Drawer>
            <DrawerTrigger>
              {session && (
                <img
                  src={session.user?.image!}
                  alt="user"
                  className="w-10 h-10 rounded-full cursor-pointer ml-2 mb-2 hover:opacity-50"
                />
              )}

              {!session ? (
                <Button className="bg-black text-white hover:bg-black/90">
                  Sign Up
                </Button>
              ) : null}
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle className="text-center">
                  Do you want to Log Out?{" "}
                </DrawerTitle>
                <DrawerDescription className="text-center">
                  This action cannot be undone.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <div>
                  <Button
                    onClick={() => {
                      signOut();
                    }}
                  >
                    Yes
                  </Button>
                </div>
                <DrawerClose>Cancel</DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </nav>
      </div>
    </header>
  );
}
