import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Habit } from "@/lib/models/Habit";
import { HabitCompletion } from "@/lib/models/HabitCompletion";
import mailSender from "@/lib/mailSender";
import { habitReminderEmail } from "@/lib/emailTemplates/habitReminderEmail";

/**
 * GET /api/test/email-send
 *
 * Sends a real habit reminder email to peraboinaudaykiran@gmail.com
 * using their ACTUAL incomplete habits from the database for today.
 */

const TARGET_EMAIL = "peraboinaudaykiran@gmail.com";

export async function GET() {
  try {
    await connectDB();

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://urhabit.vercel.app";

    // ── 1. Find the target user ──
    const user = await User.findOne({ email: TARGET_EMAIL }, "name email").lean();
    if (!user) {
      return NextResponse.json(
        { error: `User ${TARGET_EMAIL} not found in database.` },
        { status: 404 }
      );
    }

    // ── 2. Get today's date string in IST (UTC+5:30) ──
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const todayString = istDate.toISOString().split("T")[0]; // YYYY-MM-DD

    console.log(`[Test Email] Fetching habits for ${TARGET_EMAIL} on ${todayString}`);

    const userId = user._id.toString();

    // ── 3. Fetch all active habits for this user ──
    const allHabits = await Habit.find(
      { userId, isActive: true },
      "name _id"
    ).lean();

    if (allHabits.length === 0) {
      return NextResponse.json({
        message: "User has no active habits. Nothing to send.",
        totalHabits: 0,
      });
    }

    // ── 4. Fetch today's completions for this user ──
    const habitIds = allHabits.map((h) => h._id.toString());
    const completions = await HabitCompletion.find(
      { habitId: { $in: habitIds }, date: todayString, completed: true },
      "habitId"
    ).lean();

    const completedSet = new Set(completions.map((c) => c.habitId.toString()));

    const incompleteHabits = allHabits
      .filter((h) => !completedSet.has(h._id.toString()))
      .map((h) => h.name);

    const completedCount = allHabits.length - incompleteHabits.length;
    const totalCount = allHabits.length;

    if (incompleteHabits.length === 0) {
      return NextResponse.json({
        message: "All habits are already completed today! No email needed.",
        completedCount,
        totalCount,
        date: todayString,
      });
    }

    // ── 5. Build and send the email ──
    const html = habitReminderEmail({
      userName: user.name,
      completedCount,
      totalCount,
      incompleteHabits,
      appUrl,
    });

    const success = await mailSender(
      TARGET_EMAIL,
      "🌙 Don't Break the Chain — You've Got Habits Left!",
      html
    );

    if (success) {
      return NextResponse.json({
        message: `✅ Email sent to ${TARGET_EMAIL}`,
        date: todayString,
        userName: user.name,
        totalHabits: totalCount,
        completedCount,
        incompleteHabits,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email. Check MAIL_USER/MAIL_PASSWORD in .env." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Test Email] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
