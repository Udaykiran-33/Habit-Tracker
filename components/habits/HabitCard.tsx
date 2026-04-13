"use client";
import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Flame,
  Snowflake,
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
  color: string;
  completions: { date: string }[];
  streak: number;
  streakFrozen?: boolean;
}

interface HabitCardProps {
  habit: Habit;
  completedToday: boolean;
  toggling?: boolean;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onFreezeToggle: (id: string, freeze: boolean) => void;
}

export default function HabitCard({
  habit,
  completedToday,
  toggling = false,
  onToggle,
  onEdit,
  onDelete,
  onFreezeToggle,
}: HabitCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [freezing, setFreezing] = useState(false);

  const handleToggle = () => {
    if (toggling) return;
    onToggle(habit.id);
  };

  const handleFreezeToggle = async () => {
    setMenuOpen(false);
    setFreezing(true);
    await onFreezeToggle(habit.id, !habit.streakFrozen);
    setFreezing(false);
  };

  const isFrozen = habit.streakFrozen ?? false;

  return (
    <div
      className={cn(
        "group relative rounded-xl border p-2.5 sm:p-4 flex items-center gap-2.5 sm:gap-4 transition-all",
        completedToday
          ? "bg-olive-bg border-olive/50"
          : isFrozen
          ? "bg-[#0d1f2d] border-[#1e4d7a]/60"
          : "bg-surface border-border hover:border-border-hover"
      )}
    >
      {/* Color dot */}
      <div
        className="w-1 h-8 sm:h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: isFrozen ? "#60a5fa" : habit.color }}
      />

      {/* Toggle */}
      <button
        onClick={handleToggle}
        disabled={toggling || isFrozen}
        className={cn(
          "flex-shrink-0 text-muted hover:text-olive-light transition-colors",
          (toggling || isFrozen) && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        {completedToday ? (
          <CheckCircle2 size={20} className="text-olive sm:w-[22px] sm:h-[22px]" />
        ) : (
          <Circle size={20} className="sm:w-[22px] sm:h-[22px]" />
        )}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p
            className={cn(
              "font-medium text-[13px] sm:text-sm truncate",
              completedToday
                ? "text-olive-light"
                : isFrozen
                ? "text-blue-300"
                : "text-foreground"
            )}
          >
            {habit.name}
          </p>
          {isFrozen && (
            <span className="flex-shrink-0 text-[9px] sm:text-[10px] font-semibold tracking-wide text-blue-400 bg-blue-500/15 border border-blue-500/30 rounded px-1.5 py-0.5">
              FROZEN
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
          <Badge label={habit.category} variant="gray" />
        </div>
      </div>

      {/* Streak */}
      {habit.streak > 0 && (
        <div
          className={cn(
            "flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-semibold flex-shrink-0",
            isFrozen ? "text-blue-400" : "text-orange-400"
          )}
        >
          {isFrozen ? (
            <Snowflake size={12} className="sm:w-[13px] sm:h-[13px]" />
          ) : (
            <Flame size={12} className="sm:w-[13px] sm:h-[13px]" />
          )}
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
            <div className="absolute right-0 top-7 z-20 bg-surface-2 border border-border rounded-lg shadow-xl py-1 w-40">
              <button
                onClick={() => { onEdit(habit); setMenuOpen(false); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-border transition-colors"
              >
                <Pencil size={13} className="text-muted" /> Edit
              </button>

              {/* Freeze / Unfreeze */}
              <button
                onClick={handleFreezeToggle}
                disabled={freezing}
                className={cn(
                  "flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors",
                  isFrozen
                    ? "text-orange-400 hover:bg-orange-500/10"
                    : "text-blue-400 hover:bg-blue-500/10",
                  freezing && "opacity-50 cursor-wait"
                )}
              >
                {isFrozen ? (
                  <>
                    <Flame size={13} /> Unfreeze
                  </>
                ) : (
                  <>
                    <Snowflake size={13} /> Freeze Streak
                  </>
                )}
              </button>

              <div className="my-1 border-t border-border/50" />

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
