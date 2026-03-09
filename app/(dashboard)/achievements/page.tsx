"use client";
import { useEffect, useState } from "react";
import { calculateStreak, getLevel, getLevelTitle } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  color: string;
  completions: { date: string }[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: "bronze" | "silver" | "gold" | "special";
  unlocked: boolean;
  progress?: number;
  target?: number;
}

const LEVEL_TITLES = [
  "Beginner", "On Track", "Consistent", "Iron Will", "Discipline Master",
  "Elite Disciplinarian", "Habit Legend"
];

export default function AchievementsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/habits").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
    ]).then(([{ habits }, statsData]) => {
      setHabits(habits);
      setXp(statsData.xp ?? 0);
      setLoading(false);
    });
  }, []);

  const totalCompletions = habits.reduce((s, h) => s + h.completions.length, 0);
  const streaks = habits.map((h) => calculateStreak(h.completions.map((c) => c.date)));
  const bestStreak = Math.max(0, ...streaks);
  const level = getLevel(xp);
  const levelTitle = getLevelTitle(level);
  const xpProgress = ((xp % 100) / 100) * 100;

  const achievements: Achievement[] = [
    // Streak achievements
    {
      id: "streak_3",
      title: "Getting Started",
      description: "Maintain a 3-day streak on any habit",
      icon: "🌱",
      type: "bronze",
      unlocked: bestStreak >= 3,
      progress: Math.min(bestStreak, 3),
      target: 3,
    },
    {
      id: "streak_7",
      title: "One Week Wonder",
      description: "Maintain a 7-day streak on any habit",
      icon: "🔥",
      type: "bronze",
      unlocked: bestStreak >= 7,
      progress: Math.min(bestStreak, 7),
      target: 7,
    },
    {
      id: "streak_14",
      title: "Two Week Warrior",
      description: "Maintain a 14-day streak",
      icon: "⚡",
      type: "silver",
      unlocked: bestStreak >= 14,
      progress: Math.min(bestStreak, 14),
      target: 14,
    },
    {
      id: "streak_30",
      title: "Monthly Master",
      description: "Maintain a 30-day streak on any habit",
      icon: "🥈",
      type: "silver",
      unlocked: bestStreak >= 30,
      progress: Math.min(bestStreak, 30),
      target: 30,
    },
    {
      id: "streak_60",
      title: "Iron Discipline",
      description: "Maintain a 60-day streak on any habit",
      icon: "🏅",
      type: "gold",
      unlocked: bestStreak >= 60,
      progress: Math.min(bestStreak, 60),
      target: 60,
    },
    {
      id: "streak_100",
      title: "Century Club",
      description: "Maintain a 100-day streak",
      icon: "🥇",
      type: "gold",
      unlocked: bestStreak >= 100,
      progress: Math.min(bestStreak, 100),
      target: 100,
    },
    // Completion achievements
    {
      id: "comp_10",
      title: "First Steps",
      description: "Complete 10 habits total",
      icon: "👣",
      type: "bronze",
      unlocked: totalCompletions >= 10,
      progress: Math.min(totalCompletions, 10),
      target: 10,
    },
    {
      id: "comp_50",
      title: "Habit Builder",
      description: "Complete 50 habits total",
      icon: "🏗️",
      type: "bronze",
      unlocked: totalCompletions >= 50,
      progress: Math.min(totalCompletions, 50),
      target: 50,
    },
    {
      id: "comp_100",
      title: "Century Completions",
      description: "Complete 100 habits total",
      icon: "💯",
      type: "silver",
      unlocked: totalCompletions >= 100,
      progress: Math.min(totalCompletions, 100),
      target: 100,
    },
    {
      id: "comp_500",
      title: "Unstoppable",
      description: "Complete 500 habits total",
      icon: "🚀",
      type: "gold",
      unlocked: totalCompletions >= 500,
      progress: Math.min(totalCompletions, 500),
      target: 500,
    },
    // Habit creation achievements
    {
      id: "habits_3",
      title: "Habit Collector",
      description: "Create 3 different habits",
      icon: "📋",
      type: "bronze",
      unlocked: habits.length >= 3,
      progress: Math.min(habits.length, 3),
      target: 3,
    },
    {
      id: "habits_5",
      title: "System Builder",
      description: "Create 5 different habits",
      icon: "⚙️",
      type: "silver",
      unlocked: habits.length >= 5,
      progress: Math.min(habits.length, 5),
      target: 5,
    },
    // XP/Level achievements
    {
      id: "level_5",
      title: "Consistent",
      description: "Reach Level 5",
      icon: "⭐",
      type: "silver",
      unlocked: level >= 5,
      progress: Math.min(level, 5),
      target: 5,
    },
    {
      id: "level_10",
      title: "Discipline Master",
      description: "Reach Level 10",
      icon: "👑",
      type: "gold",
      unlocked: level >= 10,
      progress: Math.min(level, 10),
      target: 10,
    },
    {
      id: "xp_500",
      title: "XP Grinder",
      description: "Earn 500 total XP",
      icon: "💎",
      type: "special",
      unlocked: xp >= 500,
      progress: Math.min(xp, 500),
      target: 500,
    },
  ];

  const unlocked = achievements.filter((a) => a.unlocked).length;

  const typeColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    bronze: { bg: "#1c1408", border: "border-orange-700/30", text: "text-orange-400", badge: "🥉" },
    silver: { bg: "#141418", border: "border-slate-400/30", text: "text-slate-300", badge: "🥈" },
    gold: { bg: "#1a1500", border: "border-yellow-500/30", text: "text-yellow-400", badge: "🥇" },
    special: { bg: "#0a0a1a", border: "border-blue-400/30", text: "text-blue-400", badge: "💎" },
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-[#9F9A8C] text-sm">Loading achievements…</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#FAF6F0]">Achievements</h1>
        <p className="text-[#9F9A8C] text-sm mt-1">
          {unlocked}/{achievements.length} unlocked
        </p>
      </div>

      {/* Level Card */}
      <div className="bg-[#1a2010] border border-[#6b8c3a]/40 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#6b8c3a]/20 border-2 border-[#6b8c3a] rounded-full flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-bold text-[#8baf48]">{level}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#FAF6F0]">{levelTitle}</h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex-1 h-2 bg-[#2D2D2A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6b8c3a] rounded-full transition-all"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <span className="text-xs text-[#9F9A8C] flex-shrink-0">{xp} XP</span>
            </div>
            <p className="text-xs text-[#9F9A8C] mt-1">
              {level * 100 - xp} XP to Level {level + 1}
            </p>
          </div>
        </div>

        {/* Level path */}
        <div className="mt-4 sm:mt-5 grid grid-cols-4 sm:grid-cols-7 gap-2">
          {LEVEL_TITLES.map((title, i) => {
            const lvl = [1, 3, 5, 7, 10, 15, 20][i];
            const reached = level >= lvl;
            return (
              <div key={i} className="text-center">
                <div
                  className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold mb-1 border ${
                    reached
                      ? "bg-[#6b8c3a] border-[#6b8c3a] text-white"
                      : "bg-[#222222] border-[#2D2D2A] text-[#6B665A]"
                  }`}
                >
                  {lvl}
                </div>
                <p className="text-[9px] text-[#6B665A] leading-tight">{title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((a) => {
          const c = typeColors[a.type];
          const progressPct = a.target
            ? Math.min(100, ((a.progress ?? 0) / a.target) * 100)
            : 0;

          return (
            <div
              key={a.id}
              className={`rounded-xl border p-4 transition-all ${
                a.unlocked
                  ? `border-opacity-100 ${c.border}`
                  : "border-[#2D2D2A] opacity-60"
              }`}
              style={{ backgroundColor: a.unlocked ? c.bg : "#1A1A1A" }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{a.unlocked ? a.icon : "🔒"}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    a.unlocked
                      ? `${c.text} border-current bg-current/10`
                      : "text-[#6B665A] border-[#2D2D2A]"
                  }`}
                >
                  {a.type.toUpperCase()}
                </span>
              </div>
              <h3
                className={`font-semibold text-sm mb-1 ${
                  a.unlocked ? "text-[#FAF6F0]" : "text-[#6B665A]"
                }`}
              >
                {a.title}
              </h3>
              <p className="text-xs text-[#9F9A8C] leading-relaxed mb-3">
                {a.description}
              </p>

              {/* Progress bar */}
              {a.target && !a.unlocked && (
                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs text-[#6B665A] mb-1">
                    <span>{a.progress}</span>
                    <span>{a.target}</span>
                  </div>
                  <div className="h-1 bg-[#2D2D2A] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: "#6b8c3a",
                      }}
                    />
                  </div>
                </div>
              )}

              {a.unlocked && (
                <div className={`text-xs font-medium ${c.text} mt-1`}>
                  ✓ Unlocked
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
