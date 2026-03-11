"use client";
import { useEffect, useState, useCallback } from "react";
import { cn, getTodayString } from "@/lib/utils";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

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

  const completionDates = new Set(
    (selectedHabit === "all"
      ? habits.flatMap((h) => h.completions)
      : habits.find((h) => h.id === selectedHabit)?.completions ?? []
    ).map((c) => c.date)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getDayStatus = (dateStr: string) => {
    if (selectedHabit !== "all") {
      const isCompleted = completionDates.has(dateStr);
      return isCompleted ? "all" : "none";
    }
    
    // For "All Habits", we need to check how many were completed
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

  // Theme-aware colors
  const oliveColor = isDark ? "#6b8c3a" : "#5A7832";
  const oliveLightColor = isDark ? "#8baf48" : "#4A6828";
  const emptyColor = isDark ? "#1a1a1a" : "#E8E2D8";
  
  // Custom colors for the calendar UI to match the mockup
  const calBg = isDark ? "#1c1c1c" : "#ffffff";
  const calHeader = isDark ? "#2a2a2a" : "#f5f5f5";
  const cellEmpty = isDark ? "#232323" : "#f0f0f0";
  const cellPartial = isDark ? "#5A7832" : "#a6c97a"; // Olive mid
  const cellAll = isDark ? "#8baf48" : "#6b8c3a";     // Olive light

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={20} className="text-olive animate-spin" />
          <span className="text-muted text-sm">Loading calendar…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Calendar</h1>
        <p className="text-muted text-sm mt-1">Your habit history at a glance</p>
      </div>

      {/* Habit selector */}
      <div className="flex gap-2 flex-wrap mb-6 sm:mb-8">
        <button
          onClick={() => setSelectedHabit("all")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
            selectedHabit === "all"
              ? "bg-olive/20 border-olive text-olive-light"
              : "bg-surface border-border text-muted hover:border-border-hover"
          )}
        >
          All Habits
        </button>
        {habits.map((h) => (
          <button
            key={h.id}
            onClick={() => setSelectedHabit(h.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              selectedHabit === h.id
                ? "bg-olive/20 border-olive text-olive-light"
                : "bg-surface border-border text-muted hover:border-border-hover"
            )}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: h.color }}
            />
            <span className="truncate max-w-[100px]">{h.name}</span>
          </button>
        ))}
      </div>

      {/* Monthly Calendar Widget */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 lg:p-6 max-w-3xl mx-auto" style={{ backgroundColor: calBg }}>
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

            let bgColor = cellEmpty;
            let textColor = isDark ? "#666" : "#aaa";
            let borderColor = "transparent";

            if (!isFuture) {
              if (status === "all") {
                bgColor = cellAll;
                textColor = "#fff";
                if (isToday) borderColor = "rgba(255,255,255,0.3)";
              } else if (status === "partial") {
                bgColor = cellPartial;
                textColor = "#fff";
                if (isToday) borderColor = "rgba(255,255,255,0.3)";
              } else {
                textColor = isDark ? "#888" : "#888"; // Same as future if empty, maybe slightly lighter or darker depending on theme
                if (isToday) borderColor = isDark ? "#555" : "#ccc";
              }
            }

            return (
              <div
                key={day}
                className={cn(
                  "aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all shadow-sm",
                  isFuture ? "opacity-50" : "hover:brightness-110"
                )}
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
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: cellEmpty }} />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: cellPartial }} />
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: cellAll }} />
              <span>All</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
