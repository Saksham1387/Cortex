import prisma from "@/db";
import adminDB from "@/firebase-admin";
import { TLikedProduct } from "@/types/products";

export async function getAllUsers(userId: string) {
  const res = await prisma.user.findMany();
  const users = res.filter((user) => user.id !== userId);
  return users;
}

export async function getUserFeed(userId: string) {
  try {
    const followingRelations = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: true,
      },
    });

    const followedUsers = followingRelations.map(
      (relation) => relation.following
    );

    const allLikedProducts: {
      userId: string;
      userEmail: string;
      userName: string | null;
      products: TLikedProduct[];
    }[] = [];

    for (const user of followedUsers) {
      if (!user.email) continue;

      const likesSnapshot = await adminDB
        .collection("users")
        .doc(user.email)
        .collection("likes")
        .get();

      const likedProducts: TLikedProduct[] = [];
      likesSnapshot.forEach((doc) => {
        const data = doc.data() as TLikedProduct;
        likedProducts.push({
          ...data,
          id: doc.id,
        });
      });

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
