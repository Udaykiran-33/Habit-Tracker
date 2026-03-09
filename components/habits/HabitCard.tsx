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
          ? "bg-[#1C2412] border-[#6b8c3a]/50"
          : "bg-[#1A1A1A] border-[#2D2D2A] hover:border-[#3D3D3A]"
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
        className="flex-shrink-0 text-[#9F9A8C] hover:text-[#8baf48] transition-colors disabled:opacity-50"
      >
        {completedToday ? (
          <CheckCircle2 size={20} className="text-[#6b8c3a] sm:w-[22px] sm:h-[22px]" />
        ) : (
          <Circle size={20} className="sm:w-[22px] sm:h-[22px]" />
        )}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-medium text-[13px] sm:text-sm truncate",
            completedToday ? "text-[#8baf48]" : "text-[#FAF6F0]"
          )}
        >
          {habit.name}
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
          <Badge label={habit.category} variant="gray" />
          <span className="text-[10px] sm:text-xs text-[#6B665A]">{habit.frequency}</span>
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
          className="text-[#9F9A8C] hover:text-[#FAF6F0] transition-all p-1 sm:p-1.5 rounded-lg hover:bg-[#222222] lg:opacity-0 lg:group-hover:opacity-100"
        >
          <MoreVertical size={14} className="sm:w-[15px] sm:h-[15px]" />
        </button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-7 z-20 bg-[#222222] border border-[#2D2D2A] rounded-lg shadow-xl py-1 w-36">
              <button
                onClick={() => { onEdit(habit); setMenuOpen(false); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-[#FAF6F0] hover:bg-[#2D2D2A] transition-colors"
              >
                <Pencil size={13} className="text-[#9F9A8C]" /> Edit
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
