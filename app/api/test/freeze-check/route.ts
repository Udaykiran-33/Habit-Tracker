import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Habit } from "@/lib/models";

// GET /api/test/freeze-check — returns raw habit data to verify DB fields
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const habits = await Habit.find({
    userId: session.user.id,
    isActive: true,
  }).lean();

  const simplified = habits.map((h) => ({
    id: h._id.toString(),
    name: h.name,
    streakFrozen: (h as unknown as { streakFrozen?: boolean }).streakFrozen,
    frozenStreak: (h as unknown as { frozenStreak?: number }).frozenStreak,
  }));

  return NextResponse.json({ habits: simplified });
}
