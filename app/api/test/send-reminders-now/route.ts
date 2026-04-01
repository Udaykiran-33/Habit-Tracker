import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, Habit, HabitCompletion } from "@/lib/models";
import mailSender from "@/lib/mailSender";
import { habitReminderEmail } from "@/lib/emailTemplates/habitReminderEmail";

export const maxDuration = 60;

export async function GET() {
  try {
    await connectDB();
    const todayString = new Date().toISOString().split("T")[0];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://urhabit.vercel.app";

    // --- DEBUG STATS ---
    const totalUsers = await User.countDocuments();
    const totalHabits = await Habit.countDocuments({ isActive: true });
    const totalCompletionsToday = await HabitCompletion.countDocuments({ date: todayString, completed: true });

    // 1. Fetch Users
    const users = await User.find({}, "name email").lean();
    const userIds = users.map((u) => u._id.toString());

    // 2. Fetch Habits
    const allHabits = await Habit.find({ userId: { $in: userIds }, isActive: true }, "name userId").lean();
    
    // 3. Fetch Completions
    const allHabitIds = allHabits.map((h) => h._id.toString());
    const completions = await HabitCompletion.find({ 
      habitId: { $in: allHabitIds }, 
      date: todayString, 
      completed: true 
    }).lean();

    const completedSet = new Set(completions.map((c) => c.habitId.toString()));

    // 4. Identify Reminders
    const reminders: any[] = [];
    for (const user of users) {
      const uHabits = allHabits.filter(h => h.userId.toString() === user._id.toString());
      if (uHabits.length === 0) continue;

      const incomplete = uHabits.filter(h => !completedSet.has(h._id.toString()));
      if (incomplete.length > 0) {
        reminders.push({
          email: user.email,
          name: user.name,
          incompleteCount: incomplete.length,
          totalCount: uHabits.length,
          incompleteNames: incomplete.map(i => i.name)
        });
      }
    }

    if (reminders.length === 0) {
      return NextResponse.json({
        status: "No Reminders Needed",
        stats: {
          totalUsersInDB: totalUsers,
          activeHabitsInDB: totalHabits,
          completionsFoundForToday: totalCompletionsToday,
          dateIdentifiedAsToday: todayString,
          recommendation: "Check if habits are already marked as completed or if users have active habits."
        }
      });
    }

    // 5. Send Emails
    const results = await Promise.allSettled(
      reminders.map(r => {
        const html = habitReminderEmail({
          userName: r.name,
          completedCount: r.totalCount - r.incompleteCount,
          totalCount: r.totalCount,
          incompleteHabits: r.incompleteNames,
          appUrl
        });
        return mailSender(r.email, "👊 Don't Break the Chain!", html);
      })
    );

    const sentCount = results.filter(res => res.status === 'fulfilled' && res.value === true).length;

    return NextResponse.json({
      status: "Processing Complete",
      stats: {
        totalUsersInDB: totalUsers,
        totalRemindersAttempted: reminders.length,
        emailsSuccessfullySent: sentCount,
        emailsFailed: reminders.length - sentCount,
        recipients: reminders.map(r => r.email)
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Debug Crash", details: String(error) }, { status: 500 });
  }
}
