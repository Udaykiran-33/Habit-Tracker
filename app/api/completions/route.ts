import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Habit, HabitCompletion, User } from "@/lib/models";
import { getTodayString, calculateStreak } from "@/lib/utils";

// Streak milestones → coin reward
const STREAK_MILESTONES: { streak: number; coins: number; label: string }[] = [
  { streak: 15, coins: 1, label: "15-Day Streak" },
  { streak: 30, coins: 2, label: "30-Day Streak" },
  { streak: 60, coins: 3, label: "60-Day Streak" },
  { streak: 100, coins: 5, label: "100-Day Streak" },
];

// Total completion milestones → coin reward
const COMPLETION_MILESTONES: { total: number; coins: number; label: string }[] = [
  { total: 50,  coins: 1, label: "50 Total Completions" },
  { total: 200, coins: 2, label: "200 Total Completions" },
  { total: 500, coins: 3, label: "500 Total Completions" },
];

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

    // Get all completions for this habit (streak) and across all habits (total)
    const allHabitCompletions = await HabitCompletion.find({ habitId })
      .sort({ date: -1 }).lean();
    const completionDates = allHabitCompletions.map((c) => c.date);
    const streak = calculateStreak(completionDates, habit.frequency);

    // Get user's current state for milestone checks
    const user = await User.findById(session.user.id).lean() as {
      xp: number; coins: number; claimedStreakMilestones?: string[];
      claimedCompletionMilestones?: number[];
    } | null;

    const claimedStreaks: string[] = (user as { claimedStreakMilestones?: string[] } | null)?.claimedStreakMilestones ?? [];
    const claimedComps: number[] = (user as { claimedCompletionMilestones?: number[] } | null)?.claimedCompletionMilestones ?? [];

    // Count total completions across all habits
    const userHabits = await Habit.find({ userId: session.user.id, isActive: true }).lean();
    const habitIds = userHabits.map((h) => h._id.toString());
    const totalCompletionsCount = await HabitCompletion.countDocuments({ habitId: { $in: habitIds } });

    // Check which milestones are newly reached
    let coinsToAdd = 0;
    const rewards: string[] = [];
    const newClaimedStreaks = [...claimedStreaks];
    const newClaimedComps = [...claimedComps];

    // Streak milestones — keyed by `habitId:streakDays` so each habit can earn each milestone
    for (const m of STREAK_MILESTONES) {
      const key = `${habitId}:${m.streak}`;
      if (streak >= m.streak && !claimedStreaks.includes(key)) {
        coinsToAdd += m.coins;
        rewards.push(`${m.label} — +${m.coins} 🪙`);
        newClaimedStreaks.push(key);
      }
    }

    // Total completion milestones
    for (const m of COMPLETION_MILESTONES) {
      if (totalCompletionsCount >= m.total && !claimedComps.includes(m.total)) {
        coinsToAdd += m.coins;
        rewards.push(`${m.label} — +${m.coins} 🪙`);
        newClaimedComps.push(m.total);
      }
    }

    // Update user: XP, coins, level, claimed milestones
    const result = await User.findOneAndUpdate(
      { _id: session.user.id },
      {
        $inc: { xp: 10, coins: coinsToAdd },
        $set: {
          claimedStreakMilestones: newClaimedStreaks,
          claimedCompletionMilestones: newClaimedComps,
        },
      },
      { new: true }
    );

    if (result) {
      const newLevel = Math.floor(result.xp / 100) + 1;
      if (newLevel !== result.level) {
        await User.updateOne({ _id: session.user.id }, { $set: { level: newLevel } });
      }
    }

    return NextResponse.json({
      completed: true,
      streak,
      coinsAwarded: coinsToAdd,
      rewards,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
