import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
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
    const { userId } = await req.json();

    if (!userId || userId === session.user.id) {
      return NextResponse.json(
        {
          error:
            userId === session.user.id
              ? "Cannot follow yourself"
              : "User ID is required",
        },
        { status: 400 }
      );
    }

    const userExist = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!userExist) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for if already followed
    const alreadyFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    });

    if(alreadyFollow){
        return NextResponse.json({ error: "Already following this user" }, { status: 400 });
    }
    
    // Make the follow relation between them
    const follow = await prisma.follow.create({
      data: {
        follower: {
          connect: {
            id: session.user.id,
          },
        },
        following: {
          connect: {
            id: userExist.id,
          },
        },
      },
    });
    return NextResponse.json({ success: true, follow });
  } catch (e) {
    console.error("Error following user:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
