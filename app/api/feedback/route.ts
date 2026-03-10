import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Feedback } from "@/lib/models";

// POST — Submit feedback (authenticated users only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, category } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const feedback = await Feedback.create({
      userId: session.user.id,
      userName: session.user.name || "Anonymous",
      userEmail: session.user.email || "",
      message: message.trim(),
      category: category || "other",
    });

    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (error) {
    console.error("[Feedback] POST error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

// GET — Fetch all feedback (for admin portal)
export async function GET() {
  try {
    await connectDB();

    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ feedbacks });
  } catch (error) {
    console.error("[Feedback] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
