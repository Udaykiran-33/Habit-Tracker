import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Habit, HabitCompletion } from "@/lib/models";
import { calculateStreak } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { freeze } = await req.json();

    if (typeof freeze !== "boolean") {
      return NextResponse.json(
        { error: "freeze must be a boolean" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify ownership
    const habit = await Habit.findOne({ _id: id, userId: session.user.id });
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    let frozenStreak = habit.frozenStreak ?? 0;

    if (freeze) {
      // Calculate the current streak from completions at freeze-time and persist it
      const completions = await HabitCompletion.find({ habitId: id })
        .sort({ date: -1 })
        .lean();
      frozenStreak = calculateStreak(completions.map((c) => c.date));
    }

    await Habit.updateOne(
      { _id: id, userId: session.user.id },
      {
        $set: {
          streakFrozen: freeze,
          frozenStreak: freeze ? frozenStreak : 0,
        },
      }
    );

    return NextResponse.json({
      success: true,
      streakFrozen: freeze,
      frozenStreak: freeze ? frozenStreak : 0,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
