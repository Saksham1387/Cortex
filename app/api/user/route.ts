import prisma  from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const userUpdateSchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(),
  instagramId: z.string().optional(),
  bio: z.string().optional(),
  isPremium: z.boolean().optional(),
  requestCount: z.number().optional(),
});

export async function PATCH(req: NextRequest, res: NextResponse) {
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
    const body = await req.json();

    const validatedBody = userUpdateSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: "Invalid Input" },
        {
          status: 400,
        }
      );
    }
    const updateUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        ...validatedBody.data,
      },
    });

    return NextResponse.json({ data: updateUser, success: true ,status:200});
  } catch (e) {
    console.error("Error following user:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
