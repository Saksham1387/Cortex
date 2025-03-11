import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    isPremium?: boolean;
    requestCount?: number;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }

  interface Session {
    user: {
      id: string;
      isPremium: boolean;
      requestCount: number;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isPremium?: boolean;
    requestCount?: number;
  }
}