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

export function calculateStreak(completions: string[]): number {
  if (!completions.length) return 0;

  const sorted = [...completions].sort().reverse();
  const today = getTodayString();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Must have completed today or yesterday to have active streak
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 0;
  let current = new Date(sorted[0]);

  for (const dateStr of sorted) {
    const d = new Date(dateStr);
    const diff = Math.round(
      (current.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff <= 1) {
      streak++;
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

export const HABIT_THEMES: Record<string, {
  name: string;
  bg: string;
  bgDone: string;
  border: string;
  borderDone: string;
  accent: string;
  stripe: string;
  text: string;
  textDone: string;
  preview: [string, string, string]; // 3 colors for preview swatch
}> = {
  olive: {
    name: "Olive Green",
    bg: "#1A1A1A",
    bgDone: "#1C2412",
    border: "#2D2D2A",
    borderDone: "#6b8c3a",
    accent: "#6b8c3a",
    stripe: "#6b8c3a",
    text: "#FAF6F0",
    textDone: "#8baf48",
    preview: ["#1C2412", "#6b8c3a", "#8baf48"],
  },
  cream: {
    name: "Warm Cream",
    bg: "#1A1A1A",
    bgDone: "#1F1B15",
    border: "#2D2D2A",
    borderDone: "#B8A88A",
    accent: "#D4C5A9",
    stripe: "#D4C5A9",
    text: "#FAF6F0",
    textDone: "#D4C5A9",
    preview: ["#1F1B15", "#D4C5A9", "#FAF6F0"],
  },
  midnight: {
    name: "Dark Onyx",
    bg: "#1A1A1A",
    bgDone: "#111318",
    border: "#2D2D2A",
    borderDone: "#4A5568",
    accent: "#718096",
    stripe: "#4A5568",
    text: "#FAF6F0",
    textDone: "#A0AEC0",
    preview: ["#111318", "#4A5568", "#A0AEC0"],
  },
};

export const DEFAULT_THEME = "olive";

