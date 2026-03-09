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

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={20} className="text-[#6b8c3a] animate-spin" />
          <span className="text-[#9F9A8C] text-sm">Loading calendar…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#FAF6F0]">Calendar</h1>
        <p className="text-[#9F9A8C] text-sm mt-1">Your habit history at a glance</p>
      </div>

      {/* Habit selector */}
      <div className="flex gap-2 flex-wrap mb-6 sm:mb-8">
        <button
          onClick={() => setSelectedHabit("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            selectedHabit === "all"
              ? "bg-[#6b8c3a]/20 border-[#6b8c3a] text-[#8baf48]"
              : "bg-[#1A1A1A] border-[#2D2D2A] text-[#9F9A8C] hover:border-[#3D3D3A]"
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
                : "bg-[#1A1A1A] border-[#2D2D2A] text-[#9F9A8C] hover:border-[#3D3D3A]"
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

      {/* Monthly Calendar */}
      <div className="bg-[#1A1A1A] border border-[#2D2D2A] rounded-xl p-4 sm:p-5">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-2 rounded-lg hover:bg-[#2D2D2A] text-[#9F9A8C] hover:text-[#FAF6F0] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <h3 className="text-sm font-semibold text-[#FAF6F0]">{monthName}</h3>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-2 rounded-lg hover:bg-[#2D2D2A] text-[#9F9A8C] hover:text-[#FAF6F0] transition-colors disabled:opacity-30"
            disabled={new Date(year, month + 1, 1) > new Date()}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {days.map((d) => (
            <div key={d} className="text-center text-[10px] sm:text-xs text-[#6B665A] py-1 font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
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
                    ? "bg-[#6b8c3a] text-white ring-2 ring-[#8baf48] ring-offset-1 ring-offset-[#1A1A1A]"
                    : isCompleted
                    ? "bg-[#6b8c3a] text-white"
                    : isToday
                    ? "border border-[#6b8c3a] text-[#FAF6F0] bg-[#222222]"
                    : "text-[#9F9A8C] hover:bg-[#222222]"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Calendar legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-[#6B665A]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#6b8c3a]" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border border-[#6b8c3a]" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#222222]" />
            <span>No activity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
