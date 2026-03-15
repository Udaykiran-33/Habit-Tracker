"use client";
import { useEffect, useState } from "react";
import { cn, calculateStreak, getLevel, getLevelTitle } from "@/lib/utils";

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
  reward?: string; // coin reward label
}

const LEVEL_TITLES = [
  "Beginner", "On Track", "Consistent", "Iron Will", "Discipline Master",
  "Elite Disciplinarian", "Habit Legend"
];

export default function AchievementsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/habits").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
    ]).then(([{ habits }, statsData]) => {
      setHabits(habits ?? []);
      setXp(statsData.xp ?? 0);
      setCoins(statsData.coins ?? 0);
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
    // ── Streak achievements (coin-rewarded) ──
    {
      id: "streak_15",
      title: "Consistency Starter",
      description: "Maintain a 15-day streak on any habit",
      icon: "🌿",
      type: "bronze",
      unlocked: bestStreak >= 15,
      progress: Math.min(bestStreak, 15),
      target: 15,
      reward: "+1 🪙",
    },
    {
      id: "streak_30",
      title: "Monthly Master",
      description: "Maintain a 30-day streak on any habit",
      icon: "🔥",
      type: "silver",
      unlocked: bestStreak >= 30,
      progress: Math.min(bestStreak, 30),
      target: 30,
      reward: "+2 🪙",
    },
    {
      id: "streak_60",
      title: "Iron Discipline",
      description: "Maintain a 60-day streak on any habit",
      icon: "⚡",
      type: "gold",
      unlocked: bestStreak >= 60,
      progress: Math.min(bestStreak, 60),
      target: 60,
      reward: "+3 🪙",
    },
    {
      id: "streak_100",
      title: "Century Club",
      description: "Maintain a 100-day streak on any habit",
      icon: "🏆",
      type: "gold",
      unlocked: bestStreak >= 100,
      progress: Math.min(bestStreak, 100),
      target: 100,
      reward: "+5 🪙",
    },
    // ── Total completion achievements (coin-rewarded) ──
    {
      id: "comp_50",
      title: "Habit Builder",
      description: "Complete 50 habit check-ins total",
      icon: "🏗️",
      type: "bronze",
      unlocked: totalCompletions >= 50,
      progress: Math.min(totalCompletions, 50),
      target: 50,
      reward: "+1 🪙",
    },
    {
      id: "comp_200",
      title: "Unstoppable",
      description: "Complete 200 habit check-ins total",
      icon: "🚀",
      type: "silver",
      unlocked: totalCompletions >= 200,
      progress: Math.min(totalCompletions, 200),
      target: 200,
      reward: "+2 🪙",
    },
    {
      id: "comp_500",
      title: "Legend",
      description: "Complete 500 habit check-ins total",
      icon: "👑",
      type: "special",
      unlocked: totalCompletions >= 500,
      progress: Math.min(totalCompletions, 500),
      target: 500,
      reward: "+3 🪙",
    },
    // ── Starter achievements (no coin, just progress)
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
      icon: "⭐",
      type: "bronze",
      unlocked: bestStreak >= 7,
      progress: Math.min(bestStreak, 7),
      target: 7,
    },
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
    {
      id: "level_5",
      title: "Consistent",
      description: "Reach Level 5",
      icon: "💫",
      type: "silver",
      unlocked: level >= 5,
      progress: Math.min(level, 5),
      target: 5,
    },
    {
      id: "level_10",
      title: "Discipline Master",
      description: "Reach Level 10",
      icon: "🎯",
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

  const typeColors: Record<string, { border: string; text: string }> = {
    bronze: { border: "border-orange-700/40", text: "text-orange-400" },
    silver: { border: "border-slate-400/40", text: "text-slate-300" },
    gold:   { border: "border-yellow-500/40", text: "text-yellow-400" },
    special:{ border: "border-blue-400/40",   text: "text-blue-400"   },
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-muted text-sm">Loading achievements…</div>
      </div>
    );
  }

  const coinAchievements = achievements.filter((a) => !!a.reward);
  const otherAchievements = achievements.filter((a) => !a.reward);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Achievements</h1>
          <p className="text-muted text-sm mt-1">
            {unlocked}/{achievements.length} unlocked
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-2">
          <span className="text-lg">🪙</span>
          <span className="font-bold text-foreground text-base">{coins}</span>
          <span className="text-xs text-muted">coins</span>
        </div>
      </div>

      {/* Level Card */}
      <div className="bg-olive-bg border border-olive/40 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-olive/20 border-2 border-olive rounded-full flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-bold text-olive-light">{level}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">{levelTitle}</h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-olive rounded-full transition-all"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <span className="text-xs text-muted flex-shrink-0">{xp} XP</span>
            </div>
            <p className="text-xs text-muted mt-1">
              {level * 100 - xp} XP to Level {level + 1}
            </p>
          </div>
        </div>

        <div className="mt-4 sm:mt-5 grid grid-cols-4 sm:grid-cols-7 gap-2">
          {LEVEL_TITLES.map((title, i) => {
            const lvl = [1, 3, 5, 7, 10, 15, 20][i];
            const reached = level >= lvl;
            return (
              <div key={i} className="text-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold mb-1 border",
                    reached
                      ? "bg-olive border-olive text-white"
                      : "bg-surface-2 border-border text-dim"
                  )}
                >
                  {lvl}
                </div>
                <p className="text-[9px] text-dim leading-tight">{title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🪙 Coin Rewards Section */}
      <div className="mb-6 sm:mb-8">
        <h2 className="font-bold text-foreground text-sm mb-1">🪙 Coin Rewards</h2>
        <p className="text-xs text-muted mb-4">Complete these to earn U-coins and unlock new habits</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coinAchievements.map((a) => {
            const tc = typeColors[a.type];
            const progressPct = a.target
              ? Math.min(100, ((a.progress ?? 0) / a.target) * 100)
              : 0;
            return (
              <div
                key={a.id}
                className={cn(
                  "rounded-xl border p-4 transition-all relative",
                  a.unlocked
                    ? `${tc.border}`
                    : "border-border opacity-70"
                )}
                style={{ backgroundColor: a.unlocked ? "var(--olive-bg)" : "var(--surface)" }}
              >
                {/* Coin reward badge */}
                <div className="absolute top-3 right-3">
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    a.unlocked
                      ? "bg-olive/20 text-olive-light border border-olive/30"
                      : "bg-surface-2 text-muted border border-border"
                  )}>
                    {a.reward}
                  </span>
                </div>

                <div className="flex items-start gap-3 mb-3 pr-16">
                  <span className="text-2xl">{a.unlocked ? a.icon : "🔒"}</span>
                  <div>
                    <h3 className={cn("font-semibold text-sm", a.unlocked ? "text-foreground" : "text-dim")}>
                      {a.title}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed mt-0.5">{a.description}</p>
                  </div>
                </div>

                {a.target && !a.unlocked && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-dim mb-1">
                      <span>{a.progress}/{a.target}</span>
                      <span>{Math.round(progressPct)}%</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-olive transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {a.unlocked && (
                  <div className={`text-xs font-semibold ${tc.text} flex items-center gap-1`}>
                    <span>✓</span> Earned! Coins added to your account
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Other Achievements */}
      <div>
        <h2 className="font-bold text-foreground text-sm mb-1">🏅 Milestones</h2>
        <p className="text-xs text-muted mb-4">Track your overall progress</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherAchievements.map((a) => {
            const tc = typeColors[a.type];
            const progressPct = a.target
              ? Math.min(100, ((a.progress ?? 0) / a.target) * 100)
              : 0;
            return (
              <div
                key={a.id}
                className={cn(
                  "rounded-xl border p-4 transition-all",
                  a.unlocked ? `${tc.border}` : "border-border opacity-60"
                )}
                style={{ backgroundColor: a.unlocked ? "var(--olive-bg)" : "var(--surface)" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{a.unlocked ? a.icon : "🔒"}</span>
                  <span className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full border",
                    a.unlocked ? `${tc.text} border-current bg-current/10` : "text-dim border-border"
                  )}>
                    {a.type.toUpperCase()}
                  </span>
                </div>
                <h3 className={cn("font-semibold text-sm mb-1", a.unlocked ? "text-foreground" : "text-dim")}>
                  {a.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed mb-3">{a.description}</p>

                {a.target && !a.unlocked && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-dim mb-1">
                      <span>{a.progress}</span>
                      <span>{a.target}</span>
                    </div>
                    <div className="h-1 bg-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-olive" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                )}

                {a.unlocked && (
                  <div className={`text-xs font-medium ${tc.text} mt-1`}>✓ Unlocked</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
