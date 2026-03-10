"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import HabitCard from "@/components/habits/HabitCard";
import AddHabitModal from "@/components/habits/AddHabitModal";
import Button from "@/components/ui/Button";
import { cn, getTodayString, calculateStreak, HABIT_CATEGORIES } from "@/lib/utils";
import toast from "react-hot-toast";

interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: string;
  color: string;
  completions: { date: string }[];
  streak: number;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [filtered, setFiltered] = useState<Habit[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const today = getTodayString();

  const fetchHabits = async () => {
    const res = await fetch("/api/habits");
    const { habits: raw } = await res.json();
    const enriched = raw.map((h: Habit) => ({
      ...h,
      streak: calculateStreak(h.completions.map((c: { date: string }) => c.date)),
    }));
    setHabits(enriched);
  };

  useEffect(() => { fetchHabits(); }, []);

  useEffect(() => {
    let result = [...habits];
    if (search) {
      result = result.filter((h) =>
        h.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category !== "All") {
      result = result.filter((h) => h.category === category);
    }
    setFiltered(result);
  }, [habits, search, category]);

  const handleToggle = async (habitId: string) => {
    const res = await fetch("/api/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId }),
    });
    if (res.ok) await fetchHabits();
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
      await fetchHabits();
      toast.success(data.id ? "Habit updated!" : "Habit created!");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchHabits();
      toast.success("Habit removed");
    }
  };

  const completedCount = habits.filter((h) =>
    h.completions.some((c) => c.date === today)
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Habits</h1>
          <p className="text-muted text-sm mt-1">
            {completedCount}/{habits.length} completed today
          </p>
        </div>
        <Button onClick={() => { setEditHabit(null); setModalOpen(true); }}>
          <Plus size={15} /> New Habit
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dim"
          />
          <input
            type="text"
            placeholder="Search habits…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-dim focus:outline-none focus:border-olive"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-dim" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-olive"
          >
            <option value="All">All Categories</option>
            {HABIT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["All", ...HABIT_CATEGORIES].map((cat) => {
          const count =
            cat === "All"
              ? habits.length
              : habits.filter((h) => h.category === cat).length;
          if (cat !== "All" && count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                category === cat
                  ? "bg-olive/20 border-olive text-olive-light"
                  : "bg-surface border-border text-muted hover:border-border-hover"
              )}
            >
              {cat} {count > 0 && <span className="ml-1 opacity-60">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Habits List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-sm">
            {habits.length === 0
              ? "No habits yet. Create your first one!"
              : "No habits match your filter."}
          </p>
          {habits.length === 0 && (
            <Button
              size="sm"
              className="mt-4"
              onClick={() => { setEditHabit(null); setModalOpen(true); }}
            >
              <Plus size={14} /> Create Habit
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((habit) => (
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

      <AddHabitModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditHabit(null); }}
        onSave={handleSaveHabit}
        editHabit={editHabit}
      />
    </div>
  );
}
