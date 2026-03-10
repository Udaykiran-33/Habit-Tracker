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
  RefreshCw,
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import HabitCard from "@/components/habits/HabitCard";
import AddHabitModal from "@/components/habits/AddHabitModal";
import { getTodayString, calculateStreak, getLevel, getLevelTitle } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
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
  weekly: { day: string; completed: number; total: number }[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<DashStats | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
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
        streak: calculateStreak(h.completions.map((c: { date: string }) => c.date)),
      }));

      setHabits(enriched);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggle = async (habitId: string) => {
    const res = await fetch("/api/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId }),
    });
    if (res.ok) {
      await fetchData();
      const { completed } = await res.clone().json().catch(() => ({}));
      toast.success(completed ? "Habit completed! +10 XP" : "Unmarked");
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
      toast.success(data.id ? "Habit updated!" : "Habit created!");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchData();
      toast.success("Habit removed");
    }
  };

  const completedHabits = habits.filter((h) =>
    h.completions.some((c) => c.date === today)
  );
  const xp = stats?.xp ?? 0;
  const level = getLevel(xp);
  const levelTitle = getLevelTitle(level);
  const xpToNext = level * 100 - xp;
  const xpProgress = ((xp % 100) / 100) * 100;

  // Theme-aware chart colors
  const chartColors = {
    tick: isDark ? "#888" : "#6B6560",
    tooltipBg: isDark ? "#1c1c1c" : "#FFFFFF",
    tooltipBorder: isDark ? "#2a2a2a" : "#E0D8CC",
    tooltipText: isDark ? "#f5f5f5" : "#1a1a1a",
    barInactive: isDark ? "#2a2a2a" : "#E0D8CC",
    cursorFill: isDark ? "#1c1c1c" : "#F0EAE0",
    olive: isDark ? "#6b8c3a" : "#5A7832",
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-6xl mx-auto">
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
        <Button onClick={() => { setEditHabit(null); setModalOpen(true); }} className="flex-shrink-0">
          <Plus size={15} /> <span className="hidden sm:inline">New Habit</span><span className="sm:hidden">Add</span>
        </Button>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
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
          <StatsCard
            label="Best Streak"
            value={`${stats.bestStreak} days`}
            icon={Flame}
            sub="Keep it going!"
          />
          <StatsCard
            label="Success Rate"
            value={`${stats.successRate}%`}
            icon={TrendingUp}
            sub="Overall today"
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
          {loading ? (
            <div className="bg-surface border border-border border-dashed rounded-xl p-8 sm:p-10 flex flex-col items-center justify-center min-h-[200px]">
              <RefreshCw size={24} className="text-olive animate-spin mb-3" />
              <p className="text-muted text-sm">Loading your habits...</p>
            </div>
          ) : habits.length === 0 ? (
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

        {/* Weekly Chart */}
        <div>
          <h2 className="font-semibold text-sm sm:text-base text-foreground mb-3">Weekly Progress</h2>
          <div className="bg-surface border border-border rounded-xl p-3 sm:p-4">
            {stats?.weekly ? (
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={stats.weekly} barCategoryGap="25%">
                  <XAxis
                    dataKey="day"
                    tick={{ fill: chartColors.tick, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      borderRadius: "8px",
                      color: chartColors.tooltipText,
                      fontSize: "11px",
                    }}
                    cursor={{ fill: chartColors.cursorFill }}
                  />
                  <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                    {stats.weekly.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.day === new Date().toLocaleDateString("en-US", { weekday: "short" })
                          ? chartColors.olive
                          : chartColors.barInactive}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[170px] flex items-center justify-center text-muted text-sm">
                No data yet
              </div>
            )}
          </div>

          {/* Streak leaderboard */}
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
    </div>
  );
}
