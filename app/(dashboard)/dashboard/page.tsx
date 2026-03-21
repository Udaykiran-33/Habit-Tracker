"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CheckCircle2,
  Flame,
  Target,
  TrendingUp,
  Plus,
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import HabitCard from "@/components/habits/HabitCard";
import AddHabitModal from "@/components/habits/AddHabitModal";
import CoinUsageModal from "@/components/ui/CoinUsageModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { getTodayString, calculateStreak, getLevel, getLevelTitle } from "@/lib/utils";
// recharts removed – using custom SVG rings
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { useTheme } from "@/components/providers/ThemeProvider";

interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: string;
  color: string;
  completions: { date: string }[];
  streak: number;
}

interface DashStats {
  totalHabits: number;
  completedToday: number;
  bestStreak: number;
  successRate: number;
  xp: number;
  level: number;
  coins: number;
  weekly: { day: string; completed: number; total: number }[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<DashStats | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [coinModalOpen, setCoinModalOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const today = getTodayString();

  const isDark = theme === "dark";

  const fetchData = async () => {
    try {
      const [hRes, sRes] = await Promise.all([
      fetch("/api/habits"),
      fetch("/api/stats"),
    ]);
    const { habits: rawHabits } = await hRes.json();
    const statsData = await sRes.json();

    const enriched = rawHabits.map((h: Habit) => ({
      ...h,
      streak: calculateStreak(h.completions.map((c: { date: string }) => c.date), h.frequency),
    }));

    setHabits(enriched);
    setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggle = async (habitId: string) => {
    const today2 = getTodayString();
    // Optimistic update — flip the completion state instantly
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? {
              ...h,
              completions: h.completions.some((c) => c.date === today2)
                ? h.completions.filter((c) => c.date !== today2)
                : [...h.completions, { date: today2 }],
            }
          : h
      )
    );

    const res = await fetch("/api/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId }),
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      // Silent background sync to get accurate stats/streak
      fetchData();
      if (data.completed) {
        if (data.rewards && data.rewards.length > 0) {
          data.rewards.forEach((reward: string) => {
            toast.success(`🎉 ${reward}`, { duration: 3000 });
          });
        } else {
          toast.success("✓ +10 XP", { duration: 1000 });
        }
      } else {
        toast("Unmarked", {duration: 1000 });
      }
    } else {
      // Revert optimistic update on failure
      fetchData();
      toast.error("Failed to update", { duration: 1000 });
    }
  };

  const handleSaveHabit = async (data: Partial<Habit & { id?: string }>) => {
    const method = data.id ? "PUT" : "POST";
    const url = data.id ? `/api/habits/${data.id}` : "/api/habits";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchData();
      if (!data.id) {
        // Only show coin modal on creation, not on edit
        setCoinModalOpen(true);
      } else {
        toast.success("Habit updated!", { duration: 1000 });
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      toast.error(errData.error || "Failed to save habit", { duration: 1000 });
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/habits/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      await fetchData();
      toast.success("Habit removed", { duration: 1000 });
    }
    setDeleteId(null);
  };

  const completedHabits = habits.filter((h) =>
    h.completions.some((c) => c.date === today)
  );
  const xp = stats?.xp ?? 0;
  const level = getLevel(xp);
  const levelTitle = getLevelTitle(level);
  const xpToNext = level * 100 - xp;
  const xpProgress = ((xp % 100) / 100) * 100;

  // Ring chart helpers
  const todayShort = new Date().toLocaleDateString("en-US", { weekday: "short" });
  const ringTrack = isDark ? "#2a2a2a" : "#E0D8CC";
  const ringFill = isDark ? "#6b8c3a" : "#5A7832";
  const ringGlow = isDark ? "rgba(107,140,58,0.35)" : "rgba(90,120,50,0.25)";

  if (loading) {
    return (
      <div className="p-3 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between gap-3 animate-pulse">
          <div className="w-48 h-8 bg-surface border border-border rounded-lg" />
          <div className="flex gap-3">
            <div className="w-24 h-9 bg-surface border border-border rounded-full" />
            <div className="w-24 h-9 bg-olive/20 rounded-lg border border-border" />
          </div>
        </div>
        
        {/* XP Bar Skeleton */}
        <div className="h-16 bg-surface border border-border rounded-xl animate-pulse" />
        
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="h-24 bg-surface border border-border rounded-xl animate-pulse" />
          <div className="h-24 bg-surface border border-border rounded-xl animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="w-32 h-6 bg-surface border border-border rounded-lg animate-pulse mb-4" />
            <div className="h-24 bg-surface border border-border rounded-xl animate-pulse" />
            <div className="h-24 bg-surface border border-border rounded-xl animate-pulse" />
            <div className="h-24 bg-surface border border-border rounded-xl animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="w-32 h-6 bg-surface border border-border rounded-lg animate-pulse mb-3" />
            <div className="h-48 bg-surface border border-border rounded-xl animate-pulse" />
            <div className="h-32 bg-surface border border-border rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-6xl mx-auto anime-enter">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
            Hi, {session?.user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats !== null && (
            <div className="flex items-center bg-surface border border-border px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">
              <span className="mr-1.5" role="img" aria-label="coin">🪙</span>
              <span>{stats.coins} U</span>
            </div>
          )}
          <Button onClick={() => { setEditHabit(null); setModalOpen(true); }} className="flex-shrink-0">
            <Plus size={15} /> <span className="hidden sm:inline">New Habit</span><span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* XP Bar */}
      {stats && (
        <div className="bg-surface border border-border rounded-xl p-2.5 sm:p-4 mb-4 sm:mb-6 flex items-center gap-2.5 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-olive/20 rounded-full flex items-center justify-center text-olive-light font-bold text-xs sm:text-sm flex-shrink-0">
            {level}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                Level {level} — {levelTitle}
              </span>
              <span className="text-[9px] sm:text-xs text-muted flex-shrink-0 ml-2">{xp} XP · {xpToNext} to next</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-olive rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <StatsCard
            label="Total Habits"
            value={stats.totalHabits}
            icon={LayoutDashboard}
            sub="Active habits"
          />
          <StatsCard
            label="Completed Today"
            value={`${stats.completedToday}/${stats.totalHabits}`}
            icon={CheckCircle2}
            accent
            sub={`${stats.successRate}% success rate`}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Habits list */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm sm:text-base text-foreground">Today&apos;s Habits</h2>
            <span className="text-[10px] sm:text-xs text-muted">
              {completedHabits.length}/{habits.length} done
            </span>
          </div>
          {habits.length === 0 ? (
            <div className="bg-surface border border-border border-dashed rounded-xl p-8 sm:p-10 text-center">
              <Target size={28} className="text-disabled mx-auto mb-2" />
              <p className="text-muted text-sm">No habits yet</p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => { setEditHabit(null); setModalOpen(true); }}
              >
                <Plus size={14} /> Add your first habit
              </Button>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completedToday={habit.completions.some((c) => c.date === today)}
                  onToggle={handleToggle}
                  onEdit={(h) => { setEditHabit(h as Habit); setModalOpen(true); }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Weekly Ring Heatmap */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm sm:text-base text-foreground">Weekly Progress</h2>
            {stats?.weekly && (
              <span className="text-[10px] sm:text-xs text-muted">
                {stats.weekly.reduce((s, d) => s + d.completed, 0)}/
                {stats.weekly.reduce((s, d) => s + d.total, 0)} this week
              </span>
            )}
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            {stats?.weekly ? (() => {
              const R = 22, STROKE = 5;
              const circ = 2 * Math.PI * R;
              const weekTotal = stats.weekly.reduce((s, d) => s + d.total, 0);
              const weekDone  = stats.weekly.reduce((s, d) => s + d.completed, 0);
              const weekPct   = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;

              return (
                <>
                  {/* Day rings row — horizontally scrollable */}
                  <div
                    className="flex items-end gap-3 mb-4 overflow-x-auto scroll-smooth pb-2"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {stats.weekly.map((entry) => {
                      const isToday = entry.day === todayShort;
                      // Clamp to exactly 1.0 to avoid floating-point gap at 100%
                      const pct = entry.total > 0 ? Math.min(entry.completed / entry.total, 1) : 0;
                      const isFull = pct >= 1;
                      // When full use circ exactly so no gap; otherwise scale normally
                      const dash = isFull ? circ : pct * circ;
                      const isFullyDone = isFull && entry.total > 0;

                      return (
                        <div key={entry.day} className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{ minWidth: 72 }}>
                          {/* Ring */}
                          <div
                            className="relative"
                            style={(isToday || isFullyDone) ? { filter: `drop-shadow(0 0 7px ${ringGlow})` } : {}}
                          >
                            <svg width={54} height={54} viewBox="0 0 54 54">
                              {/* Track — hidden when full so ring color shows cleanly */}
                              <circle
                                cx={27} cy={27} r={R}
                                fill="none"
                                stroke={ringTrack}
                                strokeWidth={STROKE}
                              />
                              {/* Fill arc */}
                              <circle
                                cx={27} cy={27} r={R}
                                fill="none"
                                stroke={isToday ? ringFill : (pct > 0 ? (isDark ? "#4a6a28" : "#7aac46") : ringTrack)}
                                strokeWidth={STROKE}
                                // Use "butt" when full — round caps on a closed loop create a double-dot artifact
                                strokeLinecap={isFull ? "butt" : "round"}
                                strokeDasharray={isFull ? `${circ} 0` : `${dash} ${circ}`}
                                strokeDashoffset={circ * 0.25}
                                style={{ transition: "stroke-dasharray 0.7s ease" }}
                              />
                              {/* Center text */}
                              <text
                                x={27} y={24}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={pct === 0 ? 9 : 10}
                                fontWeight="700"
                                fill={isToday ? ringFill : (isDark ? "#aaa" : "#6B6560")}
                                style={{ fontFamily: "inherit" }}
                              >
                                {entry.total > 0 ? `${entry.completed}` : "—"}
                              </text>
                              <text
                                x={27} y={35}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={8}
                                fill={isDark ? "#555" : "#aaa"}
                                style={{ fontFamily: "inherit" }}
                              >
                                {entry.total > 0 ? `/${entry.total}` : ""}
                              </text>
                            </svg>
                            {/* Today dot */}
                            {isToday && (
                              <span
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: ringFill }}
                              />
                            )}
                          </div>
                          {/* Day label */}
                          <span
                            className="text-[9px] sm:text-[10px] font-medium"
                            style={{ color: isToday ? ringFill : (isDark ? "#666" : "#9ca3af") }}
                          >
                            {entry.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Week-total summary bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted font-medium">Week completion</span>
                      <span className="font-semibold" style={{ color: ringFill }}>{weekPct}%</span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: ringTrack }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${weekPct}%`, background: `linear-gradient(90deg, ${ringFill}99, ${ringFill})` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted mt-0.5">
                      <span>{weekDone} completed</span>
                      <span>{weekTotal - weekDone} remaining</span>
                    </div>
                  </div>
                </>
              );
            })() : (
              <div className="h-[170px] flex items-center justify-center text-muted text-sm">
                No data yet
              </div>
            )}
          </div>

          {/* Active Streaks */}
          {habits.filter((h) => h.streak > 0).length > 0 && (
            <div className="mt-3 sm:mt-4 bg-surface border border-border rounded-xl p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3">Active Streaks</h3>
              <div className="space-y-1.5 sm:space-y-2">
                {habits
                  .filter((h) => h.streak > 0)
                  .sort((a, b) => b.streak - a.streak)
                  .slice(0, 5)
                  .map((h) => (
                    <div key={h.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: h.color }} />
                        <span className="text-xs sm:text-sm text-muted truncate">{h.name}</span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-orange-400 flex-shrink-0 ml-2">{h.streak}d 🔥</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AddHabitModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditHabit(null); }}
        onSave={handleSaveHabit}
        editHabit={editHabit}
      />

      <CoinUsageModal
        isOpen={coinModalOpen}
        onClose={() => setCoinModalOpen(false)}
      />

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Habit"
        message="Are you sure you want to delete this habit? This action cannot be undone and your progress will be lost."
        confirmText="Confirm"
        cancelText="Back"
      />
    </div>
  );
}
