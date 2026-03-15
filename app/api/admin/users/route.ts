import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({})
      .select("name email coins createdAt")
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
