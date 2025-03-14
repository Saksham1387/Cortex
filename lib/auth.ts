import  prisma  from "@/db";
import GoogleProvider from "next-auth/providers/google";
import { generateUsername } from "unique-username-generator";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  
  // Use JWT strategy instead of database
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // Ensure user exists in Prisma
        const dbUser = await prisma.user.upsert({
          where: { email: user.email || "" },
          create: {
            email: (user.email)?.toString()!,
            name: generateUsername(),
            image: user.image,
          },
          update: {
            name: user.name,
            image: user.image,
          },
        });
        
        return {
          ...token,
          id: dbUser.id,
          isPremium: dbUser.isPremium || false,
          requestCount: dbUser.requestCount || 0,
        };
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isPremium = (token.isPremium as boolean) || false;
        session.user.requestCount = (token.requestCount as number) || 0;
      }
      return session;
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
}