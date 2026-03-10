"use client";
import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { calculateStreak, getTodayString } from "@/lib/utils";
import { TrendingUp, Flame, Target, Calendar, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

interface Habit {
  id: string;
  name: string;
  category: string;
  color: string;
  completions: { date: string }[];
}

interface Stats {
  totalHabits: number;
  completedToday: number;
  bestStreak: number;
  successRate: number;
  xp: number;
  level: number;
}

export default function AnalyticsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const fetchData = useCallback(async () => {
    try {
      const [habitsRes, statsRes] = await Promise.all([
        fetch("/api/habits"),
        fetch("/api/stats"),
      ]);
      const { habits: h } = await habitsRes.json();
      const s = await statsRes.json();
      setHabits(h ?? []);
      setStats(s);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to fetch analytics data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const today = getTodayString();

  // All unique completion dates across all habits
  const allCompletionDates = new Set(
    habits.flatMap((h) => h.completions.map((c) => c.date))
  );

  // Last 30 days data
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split("T")[0];
    const completed = habits.filter((h) =>
      h.completions.some((c) => c.date === dateStr)
    ).length;
    const rate = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: dateStr,
      completed,
      total: habits.length,
      rate,
    };
  });



  // Category breakdown
  const categoryInfo = habits.reduce<Record<string, { habitCount: number; totalCompletions: number; color: string }>>((acc, h) => {
    if (!acc[h.category]) acc[h.category] = { habitCount: 0, totalCompletions: 0, color: h.color };
    acc[h.category].habitCount++;
    acc[h.category].totalCompletions += h.completions.length;
    return acc;
  }, {});

  const pieData = Object.entries(categoryInfo).map(([name, info]) => ({
    name,
    value: info.habitCount,
    completions: info.totalCompletions,
    fill: info.color,
  }));

  // Streak data per habit
  const streakData = habits
    .map((h) => ({
      name: h.name.length > 15 ? h.name.slice(0, 15) + "…" : h.name,
      streak: calculateStreak(h.completions.map((c) => c.date)),
      color: h.color,
    }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 8);

  // Summary stats
  const completedToday = habits.filter((h) =>
    h.completions.some((c) => c.date === today)
  ).length;
  const successRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
  const bestStreak = Math.max(0, ...habits.map((h) => calculateStreak(h.completions.map((c) => c.date))));
  const totalCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0);
  const avgCompletionsPerDay = allCompletionDates.size > 0
    ? (totalCompletions / allCompletionDates.size).toFixed(1)
    : "0";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getDayStatus = (dateStr: string) => {
    const completedCount = habits.filter(h => h.completions.some(c => c.date === dateStr)).length;
    if (completedCount === 0) return "none";
    if (completedCount === habits.length) return "all";
    return "partial";
  };

  // Calculate perfect days in current month
  let perfectDaysCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (dateStr <= today && getDayStatus(dateStr) === "all") {
      perfectDaysCount++;
    }
  }

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Theme-aware chart colors
  const c = {
    tick: isDark ? "#555" : "#9A948C",
    tooltipBg: isDark ? "#1c1c1c" : "#FFFFFF",
    tooltipBorder: isDark ? "#2a2a2a" : "#E0D8CC",
    tooltipText: isDark ? "#f5f5f5" : "#1a1a1a",
    grid: isDark ? "#1e1e1e" : "#E0D8CC",
    olive: isDark ? "#6b8c3a" : "#5A7832",
    oliveLight: isDark ? "#8baf48" : "#4A6828",
    empty: isDark ? "#1a1a1a" : "#E8E2D8",
    legendText: isDark ? "#888" : "#6B6560",
    
    // Calendar colors
    calBg: isDark ? "#1c1c1c" : "#ffffff",
    cellEmpty: isDark ? "#232323" : "#f0f0f0",
    cellPartial: isDark ? "#5A7832" : "#a6c97a", // Olive mid
    cellAll: isDark ? "#8baf48" : "#6b8c3a",     // Olive light
  };

  const tooltipStyle = {
    background: c.tooltipBg,
    border: `1px solid ${c.tooltipBorder}`,
    borderRadius: "8px",
    color: c.tooltipText,
    fontSize: "12px",
    padding: "8px 12px",
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={20} className="text-olive animate-spin" />
          <span className="text-muted text-sm">Loading analytics…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted text-sm mt-1">
            Live data · Updated {lastRefresh.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg bg-surface border border-border text-muted hover:text-olive-light hover:border-olive/40 transition-colors"
          title="Refresh data"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: "Total Completions", value: totalCompletions, icon: Target, suffix: "" },
          { label: "Today's Rate", value: successRate, icon: TrendingUp, suffix: "%" },
          { label: "Best Streak", value: bestStreak, icon: Flame, suffix: " days" },
          { label: "Avg/Day", value: avgCompletionsPerDay, icon: Calendar, suffix: "" },
        ].map(({ label, value, icon: Icon, suffix }) => (
          <div key={label} className="bg-surface border border-border rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-olive flex-shrink-0" />
              <p className="text-[10px] sm:text-xs text-muted truncate">{label}</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground">
              {value}{suffix}
            </p>
          </div>
        ))}
      </div>

      {/* Monthly Calendar Widget */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6" style={{ backgroundColor: c.calBg }}>
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-lg hover:bg-surface-2 text-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-lg font-semibold text-foreground">{monthName}</h3>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg hover:bg-surface-2 text-muted hover:text-foreground transition-colors disabled:opacity-30"
              disabled={new Date(year, month + 1, 1) > new Date()}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <span className="text-sm font-medium text-muted">
            {perfectDaysCount} perfect day{perfectDaysCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-2">
          {days.map((d) => (
            <div key={d} className="text-center text-xs text-muted font-medium mb-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const status = getDayStatus(dateStr);
            const isToday = dateStr === today;
            const isFuture = dateStr > today;

            let bgColor = c.cellEmpty;
            let textColor = isDark ? "#666" : "#aaa";
            let borderColor = "transparent";

            if (!isFuture) {
              if (status === "all") {
                bgColor = c.cellAll;
                textColor = "#fff";
                if (isToday) borderColor = "rgba(255,255,255,0.3)";
              } else if (status === "partial") {
                bgColor = c.cellPartial;
                textColor = "#fff";
                if (isToday) borderColor = "rgba(255,255,255,0.3)";
              } else {
                textColor = isDark ? "#888" : "#888";
                if (isToday) borderColor = isDark ? "#555" : "#ccc";
              }
            }

            return (
              <div
                key={day}
                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all shadow-sm ${
                  isFuture ? "opacity-50" : "hover:brightness-110"
                }`}
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                  border: `2px solid ${borderColor}`,
                }}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Calendar legend */}
        <div className="flex items-center justify-between mt-8 text-xs text-muted font-medium gap-4 flex-wrap">
          <span className="flex items-center">
            All habits done = solid green
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>None</span>
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: c.cellEmpty }} />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: c.cellPartial }} />
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: c.cellAll }} />
              <span>All</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="mb-4 sm:mb-6">
        {/* 30-day trend */}
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5">
          <h3 className="font-semibold text-foreground mb-1 text-sm">30-Day Completion Trend</h3>
          <p className="text-[10px] text-dim mb-4">Habits completed per day</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={last30}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
              <XAxis
                dataKey="date"
                tick={{ fill: c.tick, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fill: c.tick, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [`${value} habit${value !== 1 ? "s" : ""}`, "Completed"]}
                labelFormatter={(label) => `${label}`}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke={c.olive}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: c.oliveLight, stroke: c.olive, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Streaks */}
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5">
          <h3 className="font-semibold text-foreground mb-1 text-sm">Current Streaks</h3>
          <p className="text-[10px] text-dim mb-4">Consecutive days completed</p>
          {streakData.length === 0 || streakData.every((s) => s.streak === 0) ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Flame size={24} className="text-disabled mb-2" />
              <p className="text-muted text-sm">No active streaks</p>
              <p className="text-dim text-xs mt-1">Complete habits daily to build streaks!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {streakData
                .filter((s) => s.streak > 0)
                .map((entry, i) => {
                  const maxStreak = streakData[0]?.streak || 1;
                  const width = Math.max(8, (entry.streak / maxStreak) * 100);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-muted w-20 truncate flex-shrink-0">{entry.name}</span>
                      <div className="flex-1 h-6 bg-heatmap-empty rounded-md overflow-hidden relative">
                        <div
                          className="h-full rounded-md flex items-center justify-end pr-2 transition-all duration-500"
                          style={{ width: `${width}%`, backgroundColor: c.olive }}
                        >
                          <span className="text-[10px] font-bold text-white">{entry.streak}d</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5">
          <h3 className="font-semibold text-foreground mb-1 text-sm">Habits by Category</h3>
          <p className="text-[10px] text-dim mb-4">Distribution of your habits</p>
          {pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Target size={24} className="text-disabled mb-2" />
              <p className="text-muted text-sm">No habits to analyze</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [
                    `${value} habit${value !== 1 ? "s" : ""}`,
                    name,
                  ]}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: c.legendText, fontSize: "12px" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
