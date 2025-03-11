import { prisma } from "@/db";

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
