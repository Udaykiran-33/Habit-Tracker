import { after } from "next/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Habit } from "@/lib/models/Habit";
import { HabitCompletion } from "@/lib/models/HabitCompletion";
import mailSender, { createTransporter } from "@/lib/mailSender";
import { habitReminderEmail } from "@/lib/emailTemplates/habitReminderEmail";

/**
 * GET /api/cron/habit-reminder
 *
 * Triggered by Vercel Cron at 10 PM IST (16:30 UTC) every day.
 * Sends a reminder email to every user who has at least one
 * incomplete (unmarked) habit for today.
 *
 * Architecture:
 *  - Returns HTTP 200 immediately so Vercel never hits the timeout.
 *  - Uses next/server `after()` to run the real work (DB + email) after
 *    the response is flushed — the official Next.js 15+ pattern for
 *    post-response background tasks.
 *  - All DB queries are batched (no per-user round-trips).
 *  - Emails are sent in small concurrent batches (BATCH_SIZE) with a
 *    short pause between each batch to avoid Gmail rate-limiting.
 *    Full parallel sending was causing Gmail to reject ~30% of emails.
 */

// 60 s on Pro; Hobby hard-caps at 10 s regardless.
// The `after()` callback is NOT subject to this limit.
export const maxDuration = 60;

/** How many emails to fire simultaneously per batch */
const BATCH_SIZE = 3;

/** Milliseconds pause between batches — gives Gmail's rate-limiter time to breathe */
const BATCH_DELAY_MS = 1500;

/** Small helper: resolves after `ms` milliseconds */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(req: Request) {
  // ── Auth guard ──────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[Cron] CRON_SECRET env variable is not set — aborting.");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn("[Cron] Unauthorized request.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Schedule background work AFTER the response is sent ────────────────────
  after(sendReminders());

  // Respond immediately — Vercel sees a completed request in <1 s
  return NextResponse.json({ success: true, message: "Reminder job started in background" });
}

// ── Core logic (runs post-response via after()) ──────────────────────────────
async function sendReminders() {
  const startTime = Date.now();
  console.log(`[Cron] Habit reminder triggered at ${new Date().toISOString()}`);

  try {
    await connectDB();

    const todayString = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://urhabit.vercel.app";
    console.log(`[Cron] Date: ${todayString} | App URL: ${appUrl}`);

    // 1. Fetch ALL users in one query
    const users = await User.find({}, "name email").lean();
    console.log(`[Cron] Total users found: ${users.length}`);
    if (users.length === 0) return;

    const userIds = users.map((u) => u._id.toString());

    // 2. Fetch ALL active habits in one query
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

    // 3. Fetch ALL completions for today in one query
    const allHabitIds = allHabits.map((h) => h._id.toString());
    const allCompletions = await HabitCompletion.find(
      { habitId: { $in: allHabitIds }, date: todayString, completed: true },
      "habitId"
    ).lean();
    console.log(`[Cron] Completions found for today: ${allCompletions.length}`);

    const completedHabitIdSet = new Set(
      allCompletions.map((c) => c.habitId.toString())
    );

    // 4. Build the list of users who need a reminder
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

    // 5. Send emails in small batches to avoid Gmail rate-limiting
    //
    // Full parallel (Promise.allSettled over all) caused Gmail to throttle
    // after ~9 simultaneous connections, failing the remaining recipients.
    // Batching BATCH_SIZE at a time with BATCH_DELAY_MS between batches
    // keeps concurrent connections low enough for Gmail to accept all of them.
    const transporter = createTransporter();
    let emailsSent = 0;
    let emailsFailed = 0;

    for (let i = 0; i < reminders.length; i += BATCH_SIZE) {
      const batch = reminders.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(reminders.length / BATCH_SIZE);
      console.log(`[Cron] Sending batch ${batchNumber}/${totalBatches} (${batch.length} emails)…`);

      const results = await Promise.allSettled(
        batch.map(({ email, name, incompleteHabits, completedCount, totalCount }) => {
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
            html,
            transporter
          );
        })
      );

      for (const result of results) {
        if (result.status === "fulfilled" && result.value) emailsSent++;
        else emailsFailed++;
      }

      // Pause between batches (skip delay after the last batch)
      if (i + BATCH_SIZE < reminders.length) {
        await sleep(BATCH_DELAY_MS);
      }
    }

    const elapsed = Date.now() - startTime;
    console.log(
      `[Cron] Done in ${elapsed}ms. Sent: ${emailsSent}, Failed: ${emailsFailed}, Skipped: ${users.length - reminders.length}, Total users: ${users.length}`
    );
  } catch (error) {
    console.error("[Cron] Habit reminder error:", error);
  }
}
