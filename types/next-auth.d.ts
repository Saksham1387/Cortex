import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    isPremium?: boolean;
    requestCount?: number;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    // Add location-based properties
    country?: string;
    countryCode?: string;
    googleDomain?: string;
    currency?: string;
  }

  interface Session {
    user: {
      id: string;
      isPremium: boolean;
      requestCount: number;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      // Add location-based properties
      country?: string;
      countryCode?: string;
      googleDomain?: string;
      currency?: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isPremium?: boolean;
    requestCount?: number;
    // Add location-based properties
    country?: string;
    countryCode?: string;
    googleDomain?: string;
    currency?: string;
  }
}