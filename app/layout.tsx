import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { Header } from "@/components/landing/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  console.log(session);
  return (
    <html lang="en">
      <head></head>
      <Providers session={session}>
        <body className={`${inter.className} font-serif`}>
          <Header />
          {children}
        </body>
      </Providers>
    </html>
  );
}
