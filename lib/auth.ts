import prisma from "@/db";
import GoogleProvider from "next-auth/providers/google";
import { generateUsername } from "unique-username-generator";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import axios from "axios";

// Define the type for country info
type CountryInfo = {
  domain: string;
  currency: string;
};

// Define the type for the country mapping
type CountryMapping = {
  [key: string]: CountryInfo;
};

// Country code to domain and currency mapping with proper typing
const countryToDomain: CountryMapping = {
  "IN": { domain: "google.co.in", currency: "INR" },
  "US": { domain: "google.com", currency: "USD" },
  "GB": { domain: "google.co.uk", currency: "GBP" },
  "AU": { domain: "google.com.au", currency: "AUD" },
  // Add more countries as needed
};

// Default to India if country not found in mapping
const defaultCountry = {
  name: "India",
  code: "IN",
  domain: "google.co.in",
  currency: "INR"
};

// Interface for the ipapi.co response
interface GeoResponse {
  ip: string;
  country_name: string;
  country_code: string;
  currency: string;
  [key: string]: any; // For any other properties
}

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
        try {
          // Detect user's country from IP with proper typing
          const response = await axios.get<GeoResponse>('https://ipapi.co/json/');
          const countryData = response.data;
          
          // Get country info with proper type checking
          let countryInfo: CountryInfo;
          if (countryData.country_code && countryData.country_code in countryToDomain) {
            countryInfo = countryToDomain[countryData.country_code];
          } else {
            // Fallback for unsupported countries
            countryInfo = {
              domain: `google.co.${countryData.country_code?.toLowerCase() || 'in'}`,
              currency: countryData.currency || 'INR'
            };
          }
          
          // Store location data
          const country = countryData.country_name || defaultCountry.name;
          const countryCode = countryData.country_code || defaultCountry.code;
          const googleDomain = countryInfo.domain;
          const currency = countryInfo.currency;
          
          // Ensure user exists in Prisma with location data
          const dbUser = await prisma.user.upsert({
            where: { email: user.email || "" },
            create: {
              email: (user.email)?.toString()!,
              name: generateUsername(),
              image: user.image,
              country: country,
              countryCode: countryCode,
              googleDomain: googleDomain,
              currency: currency
            },
            update: {
              name: user.name,
              image: user.image,
              country: country,
              countryCode: countryCode,
              googleDomain: googleDomain,
              currency: currency
            },
          });
          
          return {
            ...token,
            id: dbUser.id,
            isPremium: dbUser.isPremium || false,
            requestCount: dbUser.requestCount || 0,
            country: dbUser.country || defaultCountry.name,
            countryCode: dbUser.countryCode || defaultCountry.code,
            googleDomain: dbUser.googleDomain || defaultCountry.domain,
            currency: dbUser.currency || defaultCountry.currency
          };
        } catch (error) {
          console.error("Error detecting location:", error);
          
          // Ensure user exists in Prisma with default location data on error
          const dbUser = await prisma.user.upsert({
            where: { email: user.email || "" },
            create: {
              email: (user.email)?.toString()!,
              name: generateUsername(),
              image: user.image,
              country: defaultCountry.name,
              countryCode: defaultCountry.code,
              googleDomain: defaultCountry.domain,
              currency: defaultCountry.currency
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
            country: defaultCountry.name,
            countryCode: defaultCountry.code,
            googleDomain: defaultCountry.domain,
            currency: defaultCountry.currency
          };
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isPremium = (token.isPremium as boolean) || false;
        session.user.requestCount = (token.requestCount as number) || 0;
        
        // Add location data to session
        session.user.country = (token.country as string) || defaultCountry.name;
        session.user.countryCode = (token.countryCode as string) || defaultCountry.code;
        session.user.googleDomain = (token.googleDomain as string) || defaultCountry.domain;
        session.user.currency = (token.currency as string) || defaultCountry.currency;
      }
      return session;
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
}