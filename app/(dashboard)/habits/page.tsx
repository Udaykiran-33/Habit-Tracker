"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Filter, Check } from "lucide-react";
import HabitCard from "@/components/habits/HabitCard";
import AddHabitModal from "@/components/habits/AddHabitModal";
import CoinUsageModal from "@/components/ui/CoinUsageModal";
import Button from "@/components/ui/Button";
import { cn, getTodayString, calculateStreak, HABIT_CATEGORIES } from "@/lib/utils";
import toast from "react-hot-toast";

interface Habit {
  id: string;
  name: string;
  category: string;
  color: string;
  completions: { date: string }[];
  streak: number;
  streakFrozen?: boolean;
  frozenStreak?: number;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [filtered, setFiltered] = useState<Habit[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [coinModalOpen, setCoinModalOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [coins, setCoins] = useState<number | null>(null);
  const today = getTodayString();

  const fetchHabits = async () => {
    try {
      const res = await fetch("/api/habits");
      const { habits: raw } = await res.json();
      const enriched = raw.map((h: Habit & { frozenStreak?: number; streakFrozen?: boolean }) => ({
        ...h,
        // When frozen, use the server-stored frozenStreak (captured at freeze-time).
        // When not frozen, compute from completions as usual.
        streak: h.streakFrozen
          ? (h.frozenStreak ?? calculateStreak(h.completions.map((c: { date: string }) => c.date)))
          : calculateStreak(h.completions.map((c: { date: string }) => c.date)),
        streakFrozen: h.streakFrozen ?? false,
        frozenStreak: h.frozenStreak ?? 0,
      }));
      setHabits(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchCoins = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setCoins(data.coins ?? 0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHabits();
    fetchCoins();
  }, []);

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
    const targetHabit = habits.find((h) => h.id === habitId);
    const wasCompleted = targetHabit?.completions.some((c) => c.date === today);

    if (wasCompleted) {
      toast("Unmarked", { duration: 1000 });
    } else {
      toast.success("+10 XP", { duration: 1000, icon: <Check size={14} className="text-olive-light" /> });
    }

    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? {
              ...h,
              completions: wasCompleted
                ? h.completions.filter((c) => c.date !== today)
                : [...h.completions, { date: today }],
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
      await fetchHabits();
      await fetchCoins();
    } else {
      // Revert optimistic update on failure
      fetchHabits();
      toast.error("Failed to update", { duration: 1000 });
    }
  };

  // Called when user submits the AddHabitModal form
  const handleSaveHabit = async (data: Partial<Habit & { id?: string }>) => {
    if (data.id) {
      // Editing an existing habit — save immediately
      const res = await fetch(`/api/habits/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchHabits();
        toast.success("Habit updated!");
      }
    } else {
      // Creating a new habit — check coins first
      if ((coins ?? 0) < 1) {
        toast.error("Insufficient U coins. Maintain consistency to earn more!", { duration: 2500 });
        return;
      }

      // Proceed to create the habit
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // Deduct coin locally and show the CoinUsageModal
        setCoins((prev) => Math.max(0, (prev ?? 1) - 1));
        await fetchHabits();
        setModalOpen(false);
        setCoinModalOpen(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Failed to create habit", { duration: 2000 });
      }
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchHabits();
      toast.success("Habit removed");
    }
  };

  const handleFreezeToggle = async (id: string, freeze: boolean) => {
    // Optimistic update — figure out what streak value to show while in-flight
    const currentHabit = habits.find((h) => h.id === id);
    const optimisticFrozenStreak = freeze ? (currentHabit?.streak ?? 0) : 0;

    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              streakFrozen: freeze,
              frozenStreak: optimisticFrozenStreak,
              streak: freeze ? (h.streak ?? 0) : h.streak,
            }
          : h
      )
    );

    const res = await fetch(`/api/habits/${id}/freeze`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ freeze }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      // Commit server's authoritative frozenStreak to state
      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                streakFrozen: data.streakFrozen ?? freeze,
                frozenStreak: data.frozenStreak ?? optimisticFrozenStreak,
                streak: freeze
                  ? (data.frozenStreak ?? optimisticFrozenStreak)
                  : h.streak,
              }
            : h
        )
      );
      if (freeze) {
        toast.success("Streak frozen ❄️ — your streak is safe!", { duration: 2500 });
      } else {
        toast.success("Streak unfrozen 🔥 — keep the momentum!", { duration: 2500 });
      }
    } else {
      // Revert on failure
      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? { ...h, streakFrozen: !freeze, frozenStreak: currentHabit?.frozenStreak ?? 0 }
            : h
        )
      );
      toast.error("Failed to update streak freeze");
    }
  };


  const completedCount = habits.filter((h) =>
    h.completions.some((c) => c.date === today)
  ).length;

  if (initialLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="w-48 h-8 bg-surface border border-border rounded-lg mb-2" />
            <div className="w-32 h-4 bg-surface border border-border rounded-lg" />
          </div>
          <div className="w-32 h-10 bg-surface border border-border rounded-lg" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-10 bg-surface border border-border rounded-lg" />
          <div className="w-full sm:w-48 h-10 bg-surface border border-border rounded-lg" />
        </div>

        {/* Habits List Skeleton */}
        <div className="space-y-3 mt-8">
          <div className="h-24 bg-surface border border-border rounded-xl" />
          <div className="h-24 bg-surface border border-border rounded-xl" />
          <div className="h-24 bg-surface border border-border rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto anime-enter">
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
              onFreezeToggle={handleFreezeToggle}
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

      <CoinUsageModal
        isOpen={coinModalOpen}
        onClose={() => setCoinModalOpen(false)}
      />
    </div>
  );
}
