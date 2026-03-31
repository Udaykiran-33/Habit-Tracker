import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Habit } from "@/lib/models/Habit";
import { HabitCompletion } from "@/lib/models/HabitCompletion";
import mailSender from "@/lib/mailSender";
import { habitReminderEmail } from "@/lib/emailTemplates/habitReminderEmail";

/**
 * GET /api/cron/habit-reminder
 *
 * Triggered by Vercel Cron at 10 PM IST every day.
 * Sends a reminder email to every user who has at least one
 * incomplete (unmarked) habit for today.
 */
export async function GET(req: Request) {
  try {
    // ── Auth guard — only Vercel Cron or manual calls with the secret ──
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // ── Get today's date in IST (UTC+5:30) ──
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5h 30m in ms
    const istDate = new Date(now.getTime() + istOffset);
    const todayString = istDate.toISOString().split("T")[0]; // YYYY-MM-DD

    console.log(`[Cron] Running habit reminder for date: ${todayString}`);

    // ── Fetch all users ──
    const users = await User.find({}, "name email").lean();

    let emailsSent = 0;
    let emailsSkipped = 0;

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://urhabit.vercel.app";

    for (const user of users) {
      // Get all active habits for this user
      const habits = await Habit.find(
        { userId: user._id.toString(), isActive: true },
        "name"
      ).lean();

      if (habits.length === 0) {
        emailsSkipped++;
        continue;
      }

      // Get today's completions for this user's habits
      const habitIds = habits.map((h) => h._id.toString());
      const completions = await HabitCompletion.find({
        habitId: { $in: habitIds },
        date: todayString,
        completed: true,
      }).lean();

      const completedHabitIds = new Set(
        completions.map((c) => c.habitId.toString())
      );

      // Find incomplete habits
      const incompleteHabits = habits.filter(
        (h) => !completedHabitIds.has(h._id.toString())
      );

      // All done — no need to send email
      if (incompleteHabits.length === 0) {
        emailsSkipped++;
        continue;
      }

      // Build & send the email
      const html = habitReminderEmail({
        userName: user.name,
        completedCount: habits.length - incompleteHabits.length,
        totalCount: habits.length,
        incompleteHabits: incompleteHabits.map((h) => h.name),
        appUrl,
      });

      const sent = await mailSender(
        user.email,
        "🌙 Don't Break the Chain — You've Got Habits Left!",
        html
      );

      if (sent) emailsSent++;
      else emailsSkipped++;
    }

    console.log(
      `[Cron] Done. Sent: ${emailsSent}, Skipped: ${emailsSkipped}`
    );

    return NextResponse.json({
      success: true,
      date: todayString,
      emailsSent,
      emailsSkipped,
      totalUsers: users.length,
    });
  } catch (error) {
    console.error("[Cron] Habit reminder error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
