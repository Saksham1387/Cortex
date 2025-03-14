import adminDB from "@/firebase-admin";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  try {
    const likesRef = adminDB
      .collection("users")
      .doc(session?.user.email!) // This could be user email or user ID
      .collection("likes");

    await likesRef.add(body);
    return NextResponse.json({ data: "Success" });
  } catch (e) {
    console.error("Error processing request:", e);
    return NextResponse.json(
      {
        answer: "Sorry, there was an error processing your request.",
        error: "PROCESSING_ERROR",
      },
      { status: 500 }
    );
  }
}