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
    // Auto-refresh every 30 seconds for live data
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const today = getTodayString();

  // --- Computed data from live habits ---

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

  // Category breakdown with completion counts
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

  // Summary stats (computed from live data)
  const completedToday = habits.filter((h) =>
    h.completions.some((c) => c.date === today)
  ).length;
  const successRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
  const bestStreak = Math.max(0, ...habits.map((h) => calculateStreak(h.completions.map((c) => c.date))));
  const totalCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0);
  const avgCompletionsPerDay = allCompletionDates.size > 0
    ? (totalCompletions / allCompletionDates.size).toFixed(1)
    : "0";

  // Activity heatmap — binary green/black
  const heatmapData: { date: string; active: boolean }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const active = habits.some((h) => h.completions.some((c) => c.date === dateStr));
    heatmapData.push({ date: dateStr, active });
  }

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

  const tooltipStyle = {
    background: "#1c1c1c",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    color: "#f5f5f5",
    fontSize: "12px",
    padding: "8px 12px",
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={20} className="text-[#6b8c3a] animate-spin" />
          <span className="text-[#888] text-sm">Loading analytics…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#f5f5f5]">Analytics</h1>
          <p className="text-[#888] text-sm mt-1">
            Live data · Updated {lastRefresh.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg bg-[#141414] border border-[#2a2a2a] text-[#888] hover:text-[#8baf48] hover:border-[#6b8c3a]/40 transition-colors"
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
          <div key={label} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-[#6b8c3a] flex-shrink-0" />
              <p className="text-[10px] sm:text-xs text-[#888] truncate">{label}</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-[#f5f5f5]">
              {value}{suffix}
            </p>
          </div>
        ))}
      </div>

      {/* Activity Heatmap — Green / Black only */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 sm:p-5 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#f5f5f5] text-sm">Activity in the past year</h3>
          <span className="text-[10px] text-[#555]">
            {heatmapData.filter((d) => d.active).length} active days
          </span>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-[3px] min-w-max">
            {weeks.map((wk, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {wk.map((day, di) => (
                  <div
                    key={di}
                    className="w-[11px] h-[11px] rounded-[2px]"
                    style={{
                      backgroundColor: !day.date
                        ? "transparent"
                        : day.active
                        ? "#6b8c3a"
                        : "#1a1a1a",
                    }}
                    title={
                      day.date
                        ? `${day.date}: ${day.active ? "Completed" : "No activity"}`
                        : ""
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-[#555]">
          <span>No activity</span>
          <div className="w-[11px] h-[11px] rounded-[2px]" style={{ backgroundColor: "#1a1a1a" }} />
          <div className="w-[11px] h-[11px] rounded-[2px]" style={{ backgroundColor: "#6b8c3a" }} />
          <span>Completed</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* 30-day trend */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 sm:p-5">
          <h3 className="font-semibold text-[#f5f5f5] mb-1 text-sm">30-Day Completion Trend</h3>
          <p className="text-[10px] text-[#555] mb-4">Habits completed per day</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={last30}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#555", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fill: "#555", fontSize: 11 }}
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
                stroke="#6b8c3a"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#8baf48", stroke: "#6b8c3a", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly rate */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 sm:p-5">
          <h3 className="font-semibold text-[#f5f5f5] mb-1 text-sm">12-Week Success Rate</h3>
          <p className="text-[10px] text-[#555] mb-4">Percentage of habits completed each week</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last12Weeks} barCategoryGap="25%">
              <XAxis
                dataKey="week"
                tick={{ fill: "#555", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#555", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [`${value}%`, "Success Rate"]}
              />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {last12Weeks.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.rate > 0 ? "#6b8c3a" : "#1a1a1a"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Streaks */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 sm:p-5">
          <h3 className="font-semibold text-[#f5f5f5] mb-1 text-sm">Current Streaks</h3>
          <p className="text-[10px] text-[#555] mb-4">Consecutive days completed</p>
          {streakData.length === 0 || streakData.every((s) => s.streak === 0) ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Flame size={24} className="text-[#333] mb-2" />
              <p className="text-[#888] text-sm">No active streaks</p>
              <p className="text-[#555] text-xs mt-1">Complete habits daily to build streaks!</p>
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
                      <span className="text-xs text-[#888] w-20 truncate flex-shrink-0">{entry.name}</span>
                      <div className="flex-1 h-6 bg-[#1a1a1a] rounded-md overflow-hidden relative">
                        <div
                          className="h-full rounded-md flex items-center justify-end pr-2 transition-all duration-500"
                          style={{ width: `${width}%`, backgroundColor: "#6b8c3a" }}
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
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 sm:p-5">
          <h3 className="font-semibold text-[#f5f5f5] mb-1 text-sm">Habits by Category</h3>
          <p className="text-[10px] text-[#555] mb-4">Distribution of your habits</p>
          {pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Target size={24} className="text-[#333] mb-2" />
              <p className="text-[#888] text-sm">No habits to analyze</p>
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
                    <span style={{ color: "#888", fontSize: "12px" }}>{value}</span>
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
