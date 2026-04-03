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
 * Triggered by Vercel Cron at 10 PM IST (16:30 UTC) every day.
 * Sends a reminder email to every user who has at least one
 * incomplete (unmarked) habit for today.
 *
 * Optimised:
 *  - All DB queries are batched (no per-user round-trips).
 *  - Emails are sent sequentially with a 150ms delay to avoid Gmail 421 errors.
 */

// Set to 60 to use the full Pro plan budget; Hobby plan will still cap at 10s.
export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    // ── Auth guard — CRON_SECRET must always be set and match ──
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // DIAGNOSTIC logs visible in Vercel → Logs tab
    console.log(`[Cron] Auth header received: ${authHeader ? authHeader.substring(0, 15) + "..." : "NONE"}`);
    console.log(`[Cron] CRON_SECRET is set: ${!!cronSecret}, length: ${cronSecret?.length ?? 0}`);

    if (!cronSecret) {
      console.error("[Cron] CRON_SECRET env variable is not set — aborting for safety.");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn(`[Cron] Unauthorized — header does not match. Header starts with: ${authHeader?.substring(0, 15) ?? "NONE"}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();
    console.log(`[Cron] Habit reminder triggered at ${new Date().toISOString()}`);

    await connectDB();

    // ── Get today's date string (UTC, same as what the completions API saves) ──
    const todayString = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://urhabit.vercel.app";
    console.log(`[Cron] Date: ${todayString} | App URL: ${appUrl}`);

    // ── 1. Fetch ALL users in one query ──
    const users = await User.find({}, "name email").lean();
    console.log(`[Cron] Total users found: ${users.length}`);
    if (users.length === 0) {
      return NextResponse.json({ success: true, emailsSent: 0, emailsSkipped: 0, totalUsers: 0 });
    }

    const userIds = users.map((u) => u._id.toString());

    // ── 2. Fetch ALL active habits for all users in one query ──
    const allHabits = await Habit.find(
      { userId: { $in: userIds }, isActive: true },
      "name userId"
    ).lean();
    console.log(`[Cron] Total active habits found: ${allHabits.length}`);

    // Group habits by userId
    const habitsByUser = new Map<string, typeof allHabits>();
    for (const habit of allHabits) {
      const uid = habit.userId.toString();
      if (!habitsByUser.has(uid)) habitsByUser.set(uid, []);
      habitsByUser.get(uid)!.push(habit);
    }

    // ── 3. Fetch ALL completions for today in one query ──
    const allHabitIds = allHabits.map((h) => h._id.toString());
    const allCompletions = await HabitCompletion.find(
      { habitId: { $in: allHabitIds }, date: todayString, completed: true },
      "habitId"
    ).lean();
    console.log(`[Cron] Completions found for today: ${allCompletions.length}`);

    const completedHabitIdSet = new Set(
      allCompletions.map((c) => c.habitId.toString())
    );

    // ── 4. Build the list of users who need a reminder ──
    const reminders: {
      email: string;
      name: string;
      incompleteHabits: string[];
      completedCount: number;
      totalCount: number;
    }[] = [];

    for (const user of users) {
      const uid = user._id.toString();
      const habits = habitsByUser.get(uid) ?? [];
      if (habits.length === 0) continue;

      const incompleteHabits = habits.filter(
        (h) => !completedHabitIdSet.has(h._id.toString())
      );
      if (incompleteHabits.length === 0) continue;

      reminders.push({
        email: user.email,
        name: user.name,
        incompleteHabits: incompleteHabits.map((h) => h.name),
        completedCount: habits.length - incompleteHabits.length,
        totalCount: habits.length,
      });
    }

    console.log(`[Cron] Users needing reminder: ${reminders.length}`);

    // ── 5. Send all emails in parallel for maximum speed within Vercel's budget ──
    const emailResults = await Promise.allSettled(
      reminders.map(({ email, name, incompleteHabits, completedCount, totalCount }) => {
        const html = habitReminderEmail({
          userName: name,
          completedCount,
          totalCount,
          incompleteHabits,
          appUrl,
        });
        return mailSender(
          email,
          "👊 Don't Break the Chain — You've Got Habits Left!",
          html
        );
      })
    );

    let emailsSent = 0;
    let emailsFailed = 0;
    for (const result of emailResults) {
      if (result.status === "fulfilled" && result.value) emailsSent++;
      else emailsFailed++;
    }

    const emailsSkipped = users.length - reminders.length;
    const elapsed = Date.now() - startTime;

    console.log(
      `[Cron] Done in ${elapsed}ms. Sent: ${emailsSent}, Failed: ${emailsFailed}, Skipped: ${emailsSkipped}, Total users: ${users.length}`
    );

    return NextResponse.json({
      success: true,
      date: todayString,
      emailsSent,
      emailsFailed,
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
