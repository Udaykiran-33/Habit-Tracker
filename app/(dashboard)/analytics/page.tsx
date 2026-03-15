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
import { TrendingUp, Flame, Target, Calendar, RefreshCw } from "lucide-react";
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
  joinedAt: string | null;
}

export default function AnalyticsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
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

  // Daily data from join date to today
  const joinDate = stats?.joinedAt ? new Date(stats.joinedAt) : (() => { const d = new Date(); d.setDate(d.getDate() - 29); return d; })();
  const joinDateStr = joinDate.toISOString().split("T")[0];
  const todayDateObj = new Date();
  const dayCount = Math.max(1, Math.ceil((todayDateObj.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const dailySince = Array.from({ length: dayCount }, (_, i) => {
    const d = new Date(joinDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    if (dateStr > today) return null;
    const completed = habits.filter((h) =>
      h.completions.some((c) => c.date === dateStr)
    ).length;
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: dateStr,
      completed,
      total: habits.length,
    };
  }).filter(Boolean) as { date: string; fullDate: string; completed: number; total: number }[];
  // Last 12 weeks
  const last12Weeks = Array.from({ length: 12 }, (_, i) => {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - (11 - i) * 7);
    const weekDates = Array.from({ length: 7 }, (_, d) => {
      const day = new Date(weekEnd);
      day.setDate(weekEnd.getDate() - (6 - d));
      return day.toISOString().split("T")[0];
    });
    const totalPossible = habits.length * 7;
    const completions = habits.reduce((sum, h) => {
      return sum + weekDates.filter((d) => h.completions.some((c) => c.date === d)).length;
    }, 0);
    return {
      week: `W${i + 1}`,
      completions,
      possible: totalPossible,
      rate: totalPossible > 0 ? Math.round((completions / totalPossible) * 100) : 0,
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

  // Activity heatmap
  const heatmapData: { date: string; active: boolean }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const active = habits.some((h) => h.completions.some((c) => c.date === dateStr));
    heatmapData.push({ date: dateStr, active });
  }

  // Monthly calendar
  const calendarNow = new Date();
  const calYear = calendarNow.getFullYear();
  const calMonth = calendarNow.getMonth();
  const calMonthName = calendarNow.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const completedCount = habits.filter((h) =>
      h.completions.some((c) => c.date === dateStr)
    ).length;
    const totalHabits = habits.length;
    const isToday = dateStr === today;
    const isPast = dateStr <= today;
    let status: "none" | "partial" | "all" = "none";
    if (isPast && totalHabits > 0) {
      if (completedCount === totalHabits) status = "all";
      else if (completedCount > 0) status = "partial";
    }
    return { day, dateStr, status, completedCount, totalHabits, isToday };
  });

  const perfectDays = calendarDays.filter((d) => d.status === "all").length;

  // Group into weeks
  const weeks: typeof heatmapData[] = [];
  let week: typeof heatmapData = [];
  const firstHeatDate = new Date(heatmapData[0]?.date ?? today);
  const startDay = firstHeatDate.getDay();
  for (let i = 0; i < startDay; i++) {
    week.push({ date: "", active: false });
  }
  for (const entry of heatmapData) {
    week.push(entry);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push({ date: "", active: false });
    weeks.push(week);
  }

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


      {/* Monthly Calendar Activity */}
      <div className="bg-surface border border-border rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground text-sm">{calMonthName}</h3>
          <span className="text-xs text-muted">
            {perfectDays} perfect {perfectDays === 1 ? "day" : "days"}
          </span>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-center text-[10px] text-muted py-0.5">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {calendarDays.map(({ day, dateStr, status, completedCount, totalHabits, isToday }) => {
            const bgStyle =
              status === "all"
                ? { backgroundColor: c.olive }
                : status === "partial"
                ? { backgroundColor: `${c.olive}80` }
                : { backgroundColor: isDark ? "#1a2030" : "#dde3ee" };

            return (
              <div
                key={dateStr}
                title={`${dateStr}: ${completedCount}/${totalHabits} habits`}
                className="aspect-square rounded-md flex items-center justify-center"
                style={{
                  ...bgStyle,
                  outline: isToday ? `2px solid ${c.olive}` : "none",
                  outlineOffset: "2px",
                }}
              >
                <span
                  className="text-[10px] sm:text-xs font-semibold"
                  style={{
                    color:
                      status === "all" || status === "partial"
                        ? "#fff"
                        : isDark
                        ? "#4a5060"
                        : "#7a8090",
                  }}
                >
                  {day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
          <span className="text-[10px] text-muted">All habits done = solid green</span>
          <div className="flex items-center gap-2.5 text-[10px] text-muted">
            <span>None</span>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `${c.olive}80` }} />
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.olive }} />
              <span>All</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: 30-day trend + Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 30-day trend */}
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5">
          <h3 className="font-semibold text-foreground mb-1 text-sm">Daily Completion</h3>
          <p className="text-[10px] text-dim mb-4">Habits completed per day since you joined</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailySince}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
              <XAxis
                dataKey="date"
                tick={{ fill: c.tick, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={Math.max(0, Math.floor(dailySince.length / 6) - 1)}
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
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: c.tooltipText }}
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
