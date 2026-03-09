import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User, Habit, HabitCompletion } from "@/lib/models";
import { calculateStreak, getTodayString } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const today = getTodayString();

  const user = await User.findById(session.user.id)
    .select("xp level")
    .lean();

  const habits = await Habit.find({
    userId: session.user.id,
    isActive: true,
  }).lean();

  const habitIds = habits.map((h) => h._id.toString());

  const completions = await HabitCompletion.find({
    habitId: { $in: habitIds },
  })
    .sort({ date: -1 })
    .lean();

  // Group completions by habit
  const groupedCompletions: Record<string, string[]> = {};
  for (const c of completions) {
    if (!groupedCompletions[c.habitId]) groupedCompletions[c.habitId] = [];
    groupedCompletions[c.habitId].push(c.date);
  }

  const totalHabits = habits.length;
  const completedToday = habits.filter((h) =>
    groupedCompletions[h._id.toString()]?.includes(today)
  ).length;

  const streaks = habits.map((h) =>
    calculateStreak(groupedCompletions[h._id.toString()] ?? [])
  );
  const bestStreak = Math.max(0, ...streaks);
  const successRate =
    totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Weekly data (last 7 days)
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const count = habits.filter((h) =>
      groupedCompletions[h._id.toString()]?.includes(dateStr)
    ).length;
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: dateStr,
      completed: count,
      total: totalHabits,
    };
  });

  return NextResponse.json({
    totalHabits,
    completedToday,
    bestStreak,
    successRate,
    xp: user?.xp ?? 0,
    level: user?.level ?? 1,
    weekly,
    streaks: habits.map((h, i) => ({
      habitId: h._id.toString(),
      name: h.name,
      streak: streaks[i],
      color: h.color,
    })),
  });
}
