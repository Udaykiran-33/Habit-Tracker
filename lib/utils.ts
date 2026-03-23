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

export function calculateStreak(completions: string[], frequency: string = "Daily"): number {
  if (!completions.length) return 0;
  
  const sorted = [...completions].sort().reverse();
  const today = new Date();
  
  if (frequency === "Daily") {
    const todayStr = getTodayString();
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    
    // Must have completed today or yesterday to have active streak
    if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0;
    
    let streak = 0;
    let current = new Date(sorted[0]);
    
    for (const dateStr of sorted) {
      const d = new Date(dateStr);
      const diff = Math.round((current.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 1) {
        streak++;
        current = d;
      } else {
        break;
      }
    }
    return streak;
  }
  
  // Weekly or 3x per week logic
  // All date arithmetic is done in UTC to match how completion dates are stored
  // (getTodayString uses toISOString which gives UTC dates)
  const getWeekId = (date: Date): string => {
    const day = date.getUTCDay(); // 0=Sun … 6=Sat
    const d = new Date(date);
    // Shift to Monday of that week
    d.setUTCDate(d.getUTCDate() - day + (day === 0 ? -6 : 1));
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0];
  };

  // Build week → count map from all completion dates
  const completionsByWeek: Record<string, number> = {};
  for (const dateStr of sorted) {
    // Parse as UTC midnight to match storage format
    const wid = getWeekId(new Date(dateStr + "T00:00:00Z"));
    completionsByWeek[wid] = (completionsByWeek[wid] || 0) + 1;
  }

  const targetCount = frequency === "3x per week" ? 3 : 1;

  // Today's UTC date string and its week Monday
  const todayUtc = new Date(getTodayString() + "T00:00:00Z");
  const currentWeekId = getWeekId(todayUtc);

  // Previous week = 7 days before the Monday of the current week (always exact)
  const prevMonday = new Date(currentWeekId + "T00:00:00Z");
  prevMonday.setUTCDate(prevMonday.getUTCDate() - 7);
  const lastWeekId = prevMonday.toISOString().split("T")[0];

  // Streak is alive if the requirement was met this week OR last week
  // (gives a full week of grace before the streak dies)
  if (
    (completionsByWeek[currentWeekId] || 0) < targetCount &&
    (completionsByWeek[lastWeekId] || 0) < targetCount
  ) {
    return 0;
  }

  // Walk backwards week by week counting consecutive qualifying weeks
  let streak = 0;
  // If this week's target isn't yet met, start counting from last week
  let checkDate = new Date(
    (completionsByWeek[currentWeekId] || 0) >= targetCount
      ? currentWeekId + "T00:00:00Z"
      : lastWeekId + "T00:00:00Z"
  );

  while (true) {
    const wid = checkDate.toISOString().split("T")[0];
    if ((completionsByWeek[wid] || 0) >= targetCount) {
      streak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 7);
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
