import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { Adapter, AdapterUser } from "next-auth/adapters";

/**
 * Creates a custom PrismaAdapter with additional compatibility for NextAuth
 * @param prisma - PrismaClient instance
 * @returns Modified PrismaAdapter that conforms to the Adapter interface
 */
export function createCustomPrismaAdapter(prisma: PrismaClient): Adapter {
  // Start with the standard PrismaAdapter
  const standardAdapter = PrismaAdapter(prisma);
  
  return {
    ...standardAdapter,
    // Override the createUser function to match our schema
    createUser: async (user: Omit<AdapterUser, "id">) => {
      // Extract only the fields we need from the AdapterUser
      const userData = {
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      };
      
      // Create the user with our schema
      const createdUser = await prisma.user.create({
        data: userData,
      });
      
      // Convert back to AdapterUser format
      return {
        id: createdUser.id,
        email: createdUser.email,
        emailVerified: createdUser.emailVerified,
        name: createdUser.name || null,
        image: createdUser.image || null,
      } as AdapterUser;
    },
  };
}