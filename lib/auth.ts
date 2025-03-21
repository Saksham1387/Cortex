import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { OnboardingService } from '@/app/services/onboarding';

// Use PrismaClient as a singleton
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const authOptions: NextAuthOptions = {
  // Use the standard adapter - requires emailVerified field in schema
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
    // We want new users to go to onboarding after sign-up
    newUser: '/onboard',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // If we have a user, add the user ID to the token
      if (user) {
        token.userId = user.id;
      }

      // If we have account info, add it to the token
      if (account) {
        token.accessToken = account.access_token;
      }

      return token;
    },
    async session({ session, token }) {
      // Add the user ID to the session
      if (token.userId) {
        session.user.id = token.userId as string;
      }

      // Check if user has completed onboarding
      if (token.userId) {
        try {
          const hasCompletedOnboarding = await OnboardingService.hasCompletedOnboarding(
            token.userId as string
          );
          session.user.hasCompletedOnboarding = hasCompletedOnboarding;
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          session.user.hasCompletedOnboarding = false;
        }
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same domain
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      hasCompletedOnboarding: boolean;
      email?: string | null;
      image?: string | null;
      name?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    accessToken?: string;
  }
}