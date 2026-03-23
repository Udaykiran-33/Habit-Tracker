import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Habit, HabitCompletion, User } from "@/lib/models";
import { getTodayString, calculateStreak } from "@/lib/utils";



export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { habitId, date } = await req.json();
    const targetDate = date ?? getTodayString();

    await connectDB();

    const habit = await Habit.findOne({ _id: habitId, userId: session.user.id });
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const existing = await HabitCompletion.findOne({ habitId, date: targetDate });

    if (existing) {
      // Toggle off — remove completion and deduct XP
      await HabitCompletion.deleteOne({ _id: existing._id });
      await User.updateOne({ _id: session.user.id }, { $inc: { xp: -10 } });
      return NextResponse.json({ completed: false });
    }

    // Mark complete
    await HabitCompletion.create({ habitId, date: targetDate, completed: true });

    // Get all completions for streak calculation
    const allHabitCompletions = await HabitCompletion.find({ habitId })
      .sort({ date: -1 }).lean();
    const completionDates = allHabitCompletions.map((c) => c.date);
    const streak = calculateStreak(completionDates, habit.frequency);

    // Update user XP and level
    const oldUser = await User.findById(session.user.id).select("level").lean() as { level: number } | null;
    const oldLevel = oldUser?.level ?? 1;

    const result = await User.findOneAndUpdate(
      { _id: session.user.id },
      { $inc: { xp: 10 } },
      { new: true }
    );

    let leveledUp = false;
    let newLevel = oldLevel;
    if (result) {
      newLevel = Math.floor(result.xp / 100) + 1;
      if (newLevel !== result.level) {
        await User.updateOne({ _id: session.user.id }, { $set: { level: newLevel } });
      }
      leveledUp = newLevel > oldLevel;
    }

    return NextResponse.json({
      completed: true,
      streak,
      leveledUp,
      newLevel,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
