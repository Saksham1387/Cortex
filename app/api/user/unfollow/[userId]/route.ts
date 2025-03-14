import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
      }
    );
  }

  try {
    // Store the userId for once
    const userId = params.userId;

    const userExist = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!userExist) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for if already followed or not
    const alreadyFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    });

    if (!alreadyFollow) {
      return NextResponse.json(
        { error: "You are not following this user" },
        { status: 400 }
      );
    }

    // Make the unfollow request to DB
    const follow = await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error unfollowing user:", e);
    // Check if the error is because the relationship doesn't exist
    if ((e as any).code === "P2025") {
      return NextResponse.json(
        { error: "Not following this user" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
