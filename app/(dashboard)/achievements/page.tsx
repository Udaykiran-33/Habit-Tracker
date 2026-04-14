"use client";
import { useEffect, useState, useCallback } from "react";
import {
  cn, calculateStreak, getLevel, getLevelTitle,
} from "@/lib/utils";
import {
  Leaf, Flame, Zap, Trophy, Hammer, Rocket, Crown,
  Lock, Coins, CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Habit {
  id: string;
  name: string;
  color: string;
  completions: { date: string }[];
}

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any;
  type: "bronze" | "silver" | "gold" | "special";
  coinReward?: number;        // only for coin-rewarded achievements
  progress: number;
  target: number;
  unlocked: boolean;
}

const LEVEL_TITLES = [
  "Beginner", "On Track", "Consistent", "Iron Will", "Discipline Master",
  "Elite Disciplinarian", "Habit Legend",
];

export default function AchievementsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimsReady, setClaimsReady] = useState(false); // true only after server confirms claimed list
  const [claiming, setClaiming] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const [{ habits }, statsData, achData] = await Promise.all([
      fetch("/api/habits").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/achievements").then((r) => r.json()),
    ]);
    setHabits(habits ?? []);
    setXp(statsData.xp ?? 0);
    setCoins(achData.coins ?? statsData.coins ?? 0);
    setClaimedIds(achData.claimedAchievements ?? []);
    setClaimsReady(true); // server has confirmed which achievements are claimed
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const totalCompletions = habits.reduce((s, h) => s + h.completions.length, 0);
  const bestStreak = Math.max(0, ...habits.map((h) => calculateStreak(h.completions)));
  const level = getLevel(xp);
  const levelTitle = getLevelTitle(level);
  const xpProgress = ((xp % 100) / 100) * 100;

  const achievements: AchievementDef[] = [
    // ── Coin-rewarded streak achievements ──
    {
      id: "streak_8",
      title: "Consistency Starter",
      description: "Maintain an 8-day streak on any habit",
      Icon: Leaf,
      type: "bronze",
      coinReward: 1,
      progress: Math.min(bestStreak, 8),
      target: 8,
      unlocked: bestStreak >= 8,
    },
    {
      id: "streak_30",
      title: "Monthly Master",
      description: "Maintain a 30-day streak on any habit",
      Icon: Flame,
      type: "silver",
      coinReward: 2,
      progress: Math.min(bestStreak, 30),
      target: 30,
      unlocked: bestStreak >= 30,
    },
    {
      id: "streak_60",
      title: "Iron Discipline",
      description: "Maintain a 60-day streak on any habit",
      Icon: Zap,
      type: "gold",
      coinReward: 3,
      progress: Math.min(bestStreak, 60),
      target: 60,
      unlocked: bestStreak >= 60,
    },
    {
      id: "streak_100",
      title: "Century Club",
      description: "Maintain a 100-day streak on any habit",
      Icon: Trophy,
      type: "gold",
      coinReward: 5,
      progress: Math.min(bestStreak, 100),
      target: 100,
      unlocked: bestStreak >= 100,
    },
    // ── Coin-rewarded completion achievements ──
    {
      id: "comp_50",
      title: "Habit Builder",
      description: "Complete 50 habit check-ins total",
      Icon: Hammer,
      type: "bronze",
      coinReward: 1,
      progress: Math.min(totalCompletions, 50),
      target: 50,
      unlocked: totalCompletions >= 50,
    },
    {
      id: "comp_200",
      title: "Unstoppable",
      description: "Complete 200 habit check-ins total",
      Icon: Rocket,
      type: "silver",
      coinReward: 2,
      progress: Math.min(totalCompletions, 200),
      target: 200,
      unlocked: totalCompletions >= 200,
    },
    {
      id: "comp_500",
      title: "Legend",
      description: "Complete 500 habit check-ins total",
      Icon: Crown,
      type: "special",
      coinReward: 3,
      progress: Math.min(totalCompletions, 500),
      target: 500,
      unlocked: totalCompletions >= 500,
    },
  ];

  const unlocked = achievements.filter((a) => a.unlocked).length;
  const coinAchievements = achievements.filter((a) => !!a.coinReward);

  const typeColors: Record<string, { border: string; text: string; iconBg: string }> = {
    bronze:  { border: "border-orange-700/40", text: "text-orange-400",  iconBg: "bg-orange-500/15" },
    silver:  { border: "border-slate-400/40",  text: "text-slate-300",   iconBg: "bg-slate-400/15"  },
    gold:    { border: "border-yellow-500/40", text: "text-yellow-400",  iconBg: "bg-yellow-500/15" },
    special: { border: "border-blue-400/40",   text: "text-blue-400",    iconBg: "bg-blue-400/15"   },
  };

  async function claimReward(achievementId: string, coinReward: number) {
    setClaiming(achievementId);
    try {
      const res = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievementId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCoins(data.coins);
        setClaimedIds((prev) => [...prev, achievementId]);
        toast.success(`+${coinReward} coin${coinReward > 1 ? "s" : ""} added to your wallet!`, {
          icon: "🪙",
        });
      } else if (res.status === 409) {
        toast.error("Already claimed!");
      } else {
        toast.error("Failed to claim reward");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setClaiming(null);
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="w-48 h-8 bg-surface border border-border rounded-lg mb-2" />
            <div className="w-32 h-4 bg-surface border border-border rounded-lg" />
          </div>
          <div className="w-24 h-10 bg-surface border border-border rounded-xl" />
        </div>
        <div className="h-32 bg-surface-2 border border-border rounded-xl" />
        <div>
          <div className="w-32 h-5 bg-surface border border-border rounded mb-1" />
          <div className="w-64 h-3 bg-surface border border-border rounded mb-4" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-surface border border-border rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto anime-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Achievements</h1>
          <p className="text-muted text-sm mt-1">{unlocked}/{achievements.length} unlocked</p>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-2">
          <Coins size={18} className="text-yellow-400" />
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
                <div className="h-full bg-olive rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
              </div>
              <span className="text-xs text-muted flex-shrink-0">{xp} XP</span>
            </div>
            <p className="text-xs text-muted mt-1">{level * 100 - xp} XP to Level {level + 1}</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-5 grid grid-cols-4 sm:grid-cols-7 gap-2">
          {LEVEL_TITLES.map((title, i) => {
            const lvl = [1, 3, 5, 7, 10, 15, 20][i];
            const reached = level >= lvl;
            return (
              <div key={i} className="text-center">
                <div className={cn(
                  "w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold mb-1 border",
                  reached ? "bg-olive border-olive text-white" : "bg-surface-2 border-border text-dim"
                )}>
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
        <div className="flex items-center gap-2 mb-1">
          <Coins size={15} className="text-yellow-400" />
          <h2 className="font-bold text-foreground text-sm">Coin Rewards</h2>
        </div>
        <p className="text-xs text-muted mb-4">Complete these to earn U-coins and unlock new habits</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coinAchievements.map((a) => {
            const tc = typeColors[a.type];
            const progressPct = Math.min(100, (a.progress / a.target) * 100);
            const alreadyClaimed = claimedIds.includes(a.id);
            // claimsReady ensures we never show Claim until the server has confirmed what's already claimed
            const canClaim = claimsReady && a.unlocked && !alreadyClaimed;

            return (
              <div
                key={a.id}
                className={cn(
                  "rounded-xl border p-4 transition-all relative",
                  a.unlocked ? tc.border : "border-border opacity-70"
                )}
                style={{ backgroundColor: a.unlocked ? "var(--olive-bg)" : "var(--surface)" }}
              >
                {/* Coin reward badge */}
                <div className="absolute top-3 right-3">
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                    a.unlocked
                      ? "bg-olive/20 text-olive-light border border-olive/30"
                      : "bg-surface-2 text-muted border border-border"
                  )}>
                    +{a.coinReward} <Coins size={11} className={a.unlocked ? "text-yellow-400" : "text-muted"} />
                  </span>
                </div>

                <div className="flex items-start gap-3 mb-3 pr-16">
                  <div className={cn("p-2 rounded-lg flex-shrink-0", a.unlocked ? tc.iconBg : "bg-surface-2")}>
                    {a.unlocked
                      ? <a.Icon size={20} className={tc.text} />
                      : <Lock size={20} className="text-dim" />
                    }
                  </div>
                  <div>
                    <h3 className={cn("font-semibold text-sm", a.unlocked ? "text-foreground" : "text-dim")}>
                      {a.title}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed mt-0.5">{a.description}</p>
                  </div>
                </div>

                {!a.unlocked && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-dim mb-1">
                      <span>{a.progress}/{a.target}</span>
                      <span>{Math.round(progressPct)}%</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-olive transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                )}

                {a.unlocked && alreadyClaimed && (
                  <div className={`text-xs font-semibold ${tc.text} flex items-center gap-1.5`}>
                    <CheckCircle2 size={14} />
                    Coins added to your wallet
                  </div>
                )}

                {canClaim && (
                  <button
                    onClick={() => claimReward(a.id, a.coinReward!)}
                    disabled={claiming === a.id}
                    className="mt-2 w-full py-1.5 rounded-lg bg-olive hover:bg-olive/80 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
                  >
                    <Coins size={13} />
                    {claiming === a.id ? "Claiming…" : `Claim +${a.coinReward} coin${a.coinReward! > 1 ? "s" : ""}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
