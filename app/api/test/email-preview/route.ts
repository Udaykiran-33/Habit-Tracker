import { NextResponse } from "next/server";
import { habitReminderEmail } from "@/lib/emailTemplates/habitReminderEmail";

/**
 * GET /api/test/email-preview
 *
 * A simple utility route to preview the Habit Reminder Email UI directly in the browser.
 * Use this to iterate on design and layout without sending real emails.
 */
export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Mock data for the email
  const mockData = {
    userName: "Alex J. Habit",
    completedCount: 3,
    totalCount: 7,
    incompleteHabits: [
      "Wake up early (6 AM)",
      "Daily Meditation",
      "Read 20 pages",
      "Strength Training",
    ],
    appUrl,
  };

  const html = habitReminderEmail(mockData);

  // Return the HTML directly with the correct content type
  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
