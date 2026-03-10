"use client";
import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Flame,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
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

interface HabitCardProps {
  habit: Habit;
  completedToday: boolean;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export default function HabitCard({
  habit,
  completedToday,
  onToggle,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggle(habit.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl border p-2.5 sm:p-4 flex items-center gap-2.5 sm:gap-4 transition-all",
        completedToday
          ? "bg-olive-bg border-olive/50"
          : "bg-surface border-border hover:border-border-hover"
      )}
    >
      {/* Color dot */}
      <div
        className="w-1 h-8 sm:h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: habit.color }}
      />

      {/* Toggle */}
      <button
        onClick={handleToggle}
        disabled={loading}
        className="flex-shrink-0 text-muted hover:text-olive-light transition-colors disabled:opacity-50"
      >
        {completedToday ? (
          <CheckCircle2 size={20} className="text-olive sm:w-[22px] sm:h-[22px]" />
        ) : (
          <Circle size={20} className="sm:w-[22px] sm:h-[22px]" />
        )}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-medium text-[13px] sm:text-sm truncate",
            completedToday ? "text-olive-light" : "text-foreground"
          )}
        >
          {habit.name}
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
          <Badge label={habit.category} variant="gray" />
          <span className="text-[10px] sm:text-xs text-dim">{habit.frequency}</span>
        </div>
      </div>

      {/* Streak */}
      {habit.streak > 0 && (
        <div className="flex items-center gap-0.5 sm:gap-1 text-orange-400 text-[10px] sm:text-xs font-semibold flex-shrink-0">
          <Flame size={12} className="sm:w-[13px] sm:h-[13px]" />
          {habit.streak}
        </div>
      )}

      {/* Menu */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="text-muted hover:text-foreground transition-all p-1 sm:p-1.5 rounded-lg hover:bg-surface-2 lg:opacity-0 lg:group-hover:opacity-100"
        >
          <MoreVertical size={14} className="sm:w-[15px] sm:h-[15px]" />
        </button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-7 z-20 bg-surface-2 border border-border rounded-lg shadow-xl py-1 w-36">
              <button
                onClick={() => { onEdit(habit); setMenuOpen(false); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-border transition-colors"
              >
                <Pencil size={13} className="text-muted" /> Edit
              </button>
              <button
                onClick={() => { onDelete(habit.id); setMenuOpen(false); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
