import { prisma } from "@/db";
import adminDB from "@/firebase-admin";
import { TLikedProduct } from "@/types/products";

export async function getUserFeed(userId: string) {
  try {
    // Get all users that the current user follows
    const followingRelations = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: true, // Include the following user data
      },
    });

    // Extract just the users being followed
    const followedUsers = followingRelations.map(
      (relation) => relation.following
    );

    // Array to store all liked products
    const allLikedProducts: {
      userId: string;
      userEmail: string;
      userName: string | null;
      products: TLikedProduct[];
    }[] = [];

    // For each followed user, get their liked products from Firebase
    for (const user of followedUsers) {
      if (!user.email) continue; // Skip if no email (shouldn't happen but just in case)

      // Get user's liked products from Firebase
      const likesSnapshot = await adminDB
        .collection("users")
        .doc(user.email)
        .collection("likes")
        .get();

      // Transform Firebase documents to product objects
      const likedProducts: TLikedProduct[] = [];
      likesSnapshot.forEach((doc) => {
        const data = doc.data() as TLikedProduct;
        likedProducts.push({
          ...data,
          id: doc.id, // Include the document ID
        });
      });

      // Add this user's products to the result
      if (likedProducts.length > 0) {
        allLikedProducts.push({
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          products: likedProducts,
        });
      }
    }

    return {
      data: allLikedProducts,
    };
  } catch (error) {
    console.error("Error fetching followed users' likes:", error);
    return null;
  }
}

export async function getUser(userId: string) {
  let user = await prisma.user.findFirst({
    where: { id: userId },
    include: {
      followers: true,
      following: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function incrementRequestCount(userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      requestCount: {
        increment: 1,
      },
    },
  });
}

export async function getUserRequestCount(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { requestCount: true, isPremium: true },
  });
  return user;
}

export async function checkRequestLimit(userId: string): Promise<boolean> {
  const user = await getUserRequestCount(userId);

  if (!user) return false;

  if (user.isPremium) return true;

  const FREE_TIER_LIMIT = 10;
  return user.requestCount < FREE_TIER_LIMIT;
}
