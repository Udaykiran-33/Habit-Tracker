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

    // Verify habit belongs to user
    const habit = await Habit.findOne({ _id: habitId, userId: session.user.id }).lean();
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const existing = await HabitCompletion.findOne({ habitId, date: targetDate }).lean();

    if (existing) {
      // Toggle off — remove completion and deduct XP atomically
      await Promise.all([
        HabitCompletion.deleteOne({ _id: existing._id }),
        User.updateOne({ _id: session.user.id }, { $inc: { xp: -5 } }),
      ]);
      // Recalculate streak after removal so the client can sync accurately
      const remainingCompletions = await HabitCompletion.find({ habitId }).sort({ date: -1 }).lean();
      const streak = calculateStreak(remainingCompletions.map(c => ({ date: c.date, isFrozen: !!(c as any).isFrozen })));
      return NextResponse.json({ completed: false, streak });
    }

    // Create completion first, THEN fetch all dates.
    // Do NOT run find+create in parallel — if create finishes before find,
    // today's date appears in allHabitCompletions AND gets appended again → duplicate → streak = 2.
    await HabitCompletion.create({ habitId, date: targetDate, completed: true });
    const allHabitCompletions = await HabitCompletion.find({ habitId }).sort({ date: -1 }).lean();

    // No manual append — targetDate is already in the DB result above
    const completionDates = allHabitCompletions.map(c => ({ date: c.date, isFrozen: !!(c as any).isFrozen }));
    const streak = calculateStreak(completionDates);


    // Update XP and level in one query
    const result = await User.findOneAndUpdate(
      { _id: session.user.id },
      { $inc: { xp: 5 } },
      { new: true, select: "xp level" }
    );

    let leveledUp = false;
    let newLevel = result?.level ?? 1;
    if (result) {
      const computedLevel = Math.floor(result.xp / 100) + 1;
      if (computedLevel !== result.level) {
        newLevel = computedLevel;
        await User.updateOne({ _id: session.user.id }, { $set: { level: newLevel } });
        leveledUp = newLevel > (result.level ?? 1);
      }
    }

    return NextResponse.json({ completed: true, streak, leveledUp, newLevel });
  } catch (err) {
    console.error("[completions POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
