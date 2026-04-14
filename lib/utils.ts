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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function calculateStreak(completions: any[]): number {
  if (!completions.length) return 0;
  
  const mapped = completions.map(c => 
    typeof c === "string" ? { date: c, isFrozen: false } : { date: c.date, isFrozen: !!c.isFrozen }
  );

  const sorted = mapped.sort((a, b) => b.date.localeCompare(a.date));
  const todayStr = getTodayString();
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  
  // Must have completed today or yesterday to have active streak
  if (sorted[0].date !== todayStr && sorted[0].date !== yesterdayStr) return 0;
  
  let streak = 0;
  let current = new Date(sorted[0].date);
  
  for (const comp of sorted) {
    const d = new Date(comp.date);
    const diff = Math.round((current.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 1) {
      if (!comp.isFrozen) {
        streak++;
      }
      current = d;
    } else {
      break;
    }
  }
  return streak;
}

export function calculateXP(
  streaks: number[],
  completionsToday: number
): number {
  let xp = completionsToday * 5;
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
