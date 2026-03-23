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
    .select("xp level coins createdAt")
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
    calculateStreak(groupedCompletions[h._id.toString()] ?? [], h.frequency)
  );
  const bestStreak = Math.max(0, ...streaks);
  const successRate =
    totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Weekly data: Monday-based ISO week (Mon–Sun), UTC-consistent
  // Find Monday of the current UTC week
  const todayUtcMs = new Date(today + "T00:00:00Z");
  const utcDay = todayUtcMs.getUTCDay(); // 0=Sun … 6=Sat
  const daysFromMonday = utcDay === 0 ? 6 : utcDay - 1; // Mon=0 … Sun=6
  const monday = new Date(todayUtcMs);
  monday.setUTCDate(monday.getUTCDate() - daysFromMonday);

  const weekly = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(d.getUTCDate() + i);          // Mon+0, Mon+1, … Mon+6
    const dateStr = d.toISOString().split("T")[0];
    const isFuture = dateStr > today;           // don't count days not yet reached
    const count = isFuture
      ? 0
      : habits.filter((h) =>
          groupedCompletions[h._id.toString()]?.includes(dateStr)
        ).length;

    // Calculate how many habits existed on this specific day
    const habitsExistedOnDay = habits.filter((h) => {
      const createdAtStr = new Date(h.createdAt).toISOString().split("T")[0];
      return createdAtStr <= dateStr;
    }).length;

    return {
      day: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      date: dateStr,
      completed: count,
      total: isFuture ? 0 : habitsExistedOnDay, // only count habits that existed then
    };
  });

  return NextResponse.json({
    totalHabits,
    completedToday,
    bestStreak,
    successRate,
    xp: user?.xp ?? 0,
    level: user?.level ?? 1,
    coins: user?.coins ?? 0,
    joinedAt: (user as { createdAt?: Date } | null)?.createdAt?.toISOString() ?? null,
    weekly,
    streaks: habits.map((h, i) => ({
      habitId: h._id.toString(),
      name: h.name,
      streak: streaks[i],
      color: h.color,
    })),
  });
}
