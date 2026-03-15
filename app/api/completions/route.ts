import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Habit, HabitCompletion, User } from "@/lib/models";
import { getTodayString, calculateStreak } from "@/lib/utils";

// Toggle habit completion for a specific date
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
    const habit = await Habit.findOne({
      _id: habitId,
      userId: session.user.id,
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const existing = await HabitCompletion.findOne({
      habitId,
      date: targetDate,
    });

    if (existing) {
      // Toggle off
      await HabitCompletion.deleteOne({ _id: existing._id });

      // Deduct XP
      await User.updateOne(
        { _id: session.user.id },
        { $inc: { xp: -10 } }
      );

      return NextResponse.json({ completed: false });
    } else {
      // Mark complete
      await HabitCompletion.create({
        habitId,
        date: targetDate,
        completed: true,
      });

      // Fetch all completions for streak calculation
      const allCompletions = await HabitCompletion.find({ habitId })
        .sort({ date: -1 })
        .lean();
      
      const completionDates = allCompletions.map(c => c.date);
      const isDaily = habit.frequency === "Daily"; // Only daily for now, will update later for other frequencies
      
      // Calculate streak
      const streak = calculateStreak(completionDates, habit.frequency);

      // Award coins for 15-day consistency
      let coinAwarded = false;
      if (streak > 0 && streak % 15 === 0) {
        coinAwarded = true;
      }

      // Update user XP and coins
      const result = await User.findOneAndUpdate(
        { _id: session.user.id },
        { 
          $inc: { 
            xp: 10,
            coins: coinAwarded ? 1 : 0
          } 
        },
        { new: true }
      );

      // Update level based on XP
      if (result) {
        const newLevel = Math.floor(result.xp / 100) + 1;
        if (newLevel !== result.level) {
          await User.updateOne(
            { _id: session.user.id },
            { $set: { level: newLevel } }
          );
        }
      }

      return NextResponse.json({ completed: true });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
