"use client";
import { useEffect, useState, useCallback } from "react";
import { getTodayString } from "@/lib/utils";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  color: string;
  completions: { date: string }[];
}

export default function CalendarPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<string>("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/habits");
      const { habits: h } = await res.json();
      setHabits(h ?? []);
    } catch (err) {
      console.error("Failed to fetch habits:", err);
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

  // Get filtered completion dates
  const completionDates = new Set(
    (selectedHabit === "all"
      ? habits.flatMap((h) => h.completions)
      : habits.find((h) => h.id === selectedHabit)?.completions ?? []
    ).map((c) => c.date)
  );

  // Calendar month info
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Build heatmap — binary: completed (green) / not (black)
  const heatmapData: { date: string; active: boolean }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const active =
      selectedHabit === "all"
        ? habits.some((h) => h.completions.some((c) => c.date === dateStr))
        : habits
            .find((h) => h.id === selectedHabit)
            ?.completions.some((c) => c.date === dateStr) ?? false;
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

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Month labels for the heatmap
  const monthPositions: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((wk, wi) => {
    const validDay = wk.find((d) => d.date);
    if (validDay) {
      const m = new Date(validDay.date).getMonth();
      if (m !== lastMonth) {
        monthPositions.push({ label: monthLabels[m], col: wi });
        lastMonth = m;
      }
    }
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={20} className="text-[#6b8c3a] animate-spin" />
          <span className="text-[#888] text-sm">Loading calendar…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#f5f5f5]">Calendar</h1>
        <p className="text-[#888] text-sm mt-1">Your habit history at a glance</p>
      </div>

      {/* Habit selector */}
      <div className="flex gap-2 flex-wrap mb-6 sm:mb-8">
        <button
          onClick={() => setSelectedHabit("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            selectedHabit === "all"
              ? "bg-[#6b8c3a]/20 border-[#6b8c3a] text-[#8baf48]"
              : "bg-[#141414] border-[#2a2a2a] text-[#888] hover:border-[#444]"
          }`}
        >
          All Habits
        </button>
        {habits.map((h) => (
          <button
            key={h.id}
            onClick={() => setSelectedHabit(h.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              selectedHabit === h.id
                ? "bg-[#6b8c3a]/20 border-[#6b8c3a] text-[#8baf48]"
                : "bg-[#141414] border-[#2a2a2a] text-[#888] hover:border-[#444]"
            }`}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: h.color }}
            />
            <span className="truncate max-w-[100px]">{h.name}</span>
          </button>
        ))}
      </div>

      {/* Activity Heatmap — Binary green/black */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 sm:p-5 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#f5f5f5]">Activity in the past year</h3>
          <span className="text-[10px] text-[#555]">
            {heatmapData.filter((d) => d.active).length} active days
          </span>
        </div>

        {/* Month labels */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-max">
            <div className="flex gap-[3px] mb-1 pl-0">
              {monthPositions.map(({ label, col }, i) => {
                const nextCol = monthPositions[i + 1]?.col ?? weeks.length;
                const span = nextCol - col;
                return (
                  <span
                    key={`${label}-${col}`}
                    className="text-[10px] text-[#555] inline-block"
                    style={{ width: `${span * 14}px` }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
            <div className="flex gap-[3px]">
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
        </div>

        {/* Legend — Binary */}
        <div className="flex items-center gap-2 mt-3 text-xs text-[#555]">
          <span>No activity</span>
          <div className="w-[11px] h-[11px] rounded-[2px]" style={{ backgroundColor: "#1a1a1a" }} />
          <div className="w-[11px] h-[11px] rounded-[2px]" style={{ backgroundColor: "#6b8c3a" }} />
          <span>Completed</span>
        </div>
      </div>

      {/* Monthly Calendar */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 sm:p-5">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-2 rounded-lg hover:bg-[#2a2a2a] text-[#888] hover:text-[#f5f5f5] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <h3 className="text-sm font-semibold text-[#f5f5f5]">{monthName}</h3>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-2 rounded-lg hover:bg-[#2a2a2a] text-[#888] hover:text-[#f5f5f5] transition-colors disabled:opacity-30"
            disabled={new Date(year, month + 1, 1) > new Date()}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {days.map((d) => (
            <div key={d} className="text-center text-[10px] sm:text-xs text-[#555] py-1 font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells — fixed height, no aspect-square */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty padding cells */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`pad-${i}`} className="h-9 sm:h-10" />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isCompleted = completionDates.has(dateStr);
            const isToday = dateStr === today;
            const isFuture = dateStr > today;

            return (
              <div
                key={day}
                className={`h-9 sm:h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                  isFuture
                    ? "text-[#333]"
                    : isCompleted && isToday
                    ? "bg-[#6b8c3a] text-white ring-2 ring-[#8baf48] ring-offset-1 ring-offset-[#141414]"
                    : isCompleted
                    ? "bg-[#6b8c3a] text-white"
                    : isToday
                    ? "border border-[#6b8c3a] text-[#f5f5f5] bg-[#1c1c1c]"
                    : "text-[#888] hover:bg-[#1c1c1c]"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Calendar legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-[#555]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#6b8c3a]" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border border-[#6b8c3a]" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#1c1c1c]" />
            <span>No activity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
