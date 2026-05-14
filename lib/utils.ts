import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Calculate a habit streak from completion records.
 *
 * Accepts either:
 *  - `string[]`  (plain date strings, legacy format)
 *  - `{ date: string; isFrozen?: boolean }[]` (includes frozen-day info)
 *
 * Frozen days bridge the gap in a streak (they keep it alive) but do NOT
 * increment the streak counter themselves.
 */
export function calculateStreak(
  completions: string[] | { date: string; isFrozen?: boolean }[]
): number {
  if (!completions.length) return 0;

  // Normalise to { date, isFrozen } objects
  const normalised: { date: string; isFrozen: boolean }[] = completions.map(
    (c) =>
      typeof c === "string"
        ? { date: c, isFrozen: false }
        : { date: c.date, isFrozen: !!c.isFrozen }
  );

  // Sort descending by date
  normalised.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));

  const today = getTodayString();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // The most recent record must be today or yesterday to have an active streak
  if (normalised[0].date !== today && normalised[0].date !== yesterday) return 0;

  let streak = 0;
  let current = new Date(normalised[0].date + "T00:00:00Z");

  for (const entry of normalised) {
    const d = new Date(entry.date + "T00:00:00Z");
    const diff = Math.round(
      (current.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff > 1) break; // gap found — streak ends

    current = d;

    // Frozen days bridge the gap but don't count toward the streak number
    if (!entry.isFrozen) {
      streak++;
    }
  }
  return streak;
}

export function calculateXP(
  streaks: number[],
  completionsToday: number
): number {
  let xp = completionsToday * 10;
  for (const s of streaks) {
    if (s >= 7) xp += 50;
    if (s >= 30) xp += 200;
    if (s >= 100) xp += 500;
  }
  return xp;
}

export function getLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function getLevelTitle(level: number): string {
  if (level >= 20) return "Habit Legend";
  if (level >= 15) return "Elite Disciplinarian";
  if (level >= 10) return "Discipline Master";
  if (level >= 7) return "Iron Will";
  if (level >= 5) return "Consistent";
  if (level >= 3) return "On Track";
  return "Beginner";
}

export function getXPToNextLevel(xp: number): number {
  const level = getLevel(xp);
  return level * 100 - xp;
}

export const HABIT_CATEGORIES = [
  "Health & Fitness",
  "Learning",
  "Productivity",
  "Mindfulness",
  "Social",
  "Finance",
  "Creativity",
  "General",
];

export const HABIT_ICONS = [
  "target",
  "dumbbell",
  "book-open",
  "code",
  "heart",
  "brain",
  "coffee",
  "moon",
  "sun",
  "music",
  "pen",
  "star",
];

export const OLIVE_COLORS = [
  "#4A5C2F",
  "#6B8C3A",
  "#8BAF48",
  "#3D4F27",
  "#5A7832",
  "#7A9E43",
];
