"use client";
import { getLevelTitle } from "@/lib/utils";
import { Trophy, Sparkles, ArrowRight } from "lucide-react";

const LEVEL_QUOTES: Record<number, string> = {
  2:  "Every journey starts with a single step. You've taken yours — keep going!",
  3:  "Consistency is the hallmark of the undefeated. You're proving it.",
  4:  "Small daily improvements lead to stunning results over time.",
  5:  "You are what you repeatedly do. Excellence is becoming your habit.",
  6:  "The secret of your future is hidden in your daily routine. Stay locked in.",
  7:  "Iron will is forged through daily commitment. You're building yours.",
  8:  "Discipline is choosing what you want most over what you want right now.",
  9:  "You're not just building habits — you're building character.",
  10: "Level 10? That's not luck — that's mastery in the making.",
  15: "Elite disciplinarians are rare. You're becoming one of them.",
  20: "Legends aren't born. They're built — one habit at a time. You are one.",
};

function getQuote(level: number): string {
  // Find the closest matching quote ≤ current level
  const keys = Object.keys(LEVEL_QUOTES)
    .map(Number)
    .filter((k) => k <= level)
    .sort((a, b) => b - a);
  const key = keys[0];
  return key
    ? LEVEL_QUOTES[key]
    : "Every level up is proof that you show up even when it's hard. Keep pushing!";
}

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  onClose: () => void;
}

export default function LevelUpModal({ isOpen, newLevel, onClose }: LevelUpModalProps) {
  if (!isOpen) return null;

  const title = getLevelTitle(newLevel);
  const quote = getQuote(newLevel);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
      <div
        className="relative w-full max-w-sm rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
        style={{ backgroundColor: "var(--surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accents */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: "var(--olive-mid)" }} />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ backgroundColor: "var(--olive-light)" }} />

        <div className="relative p-6 sm:p-8 text-center">
          {/* Badge */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-4"
                style={{ backgroundColor: "color-mix(in srgb, var(--olive-mid) 20%, transparent)", borderColor: "var(--olive-mid)" }}>
                <span className="text-3xl font-extrabold" style={{ color: "var(--olive-light)" }}>
                  {newLevel}
                </span>
              </div>
              {/* Sparkle badge */}
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center animate-bounce"
                style={{ backgroundColor: "var(--olive-mid)" }}>
                <Sparkles size={13} className="text-white" />
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy size={16} style={{ color: "var(--olive-light)" }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--olive-light)" }}>
              Level Up!
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold mb-1" style={{ color: "var(--foreground)" }}>
            You&apos;re now <span style={{ color: "var(--olive-light)" }}>{title}</span>
          </h2>
          <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>
            Level {newLevel} achieved
          </p>

          {/* Quote */}
          <blockquote
            className="border-l-4 text-left px-4 py-3 rounded-lg mb-6 italic text-sm leading-relaxed"
            style={{
              borderColor: "var(--olive-mid)",
              backgroundColor: "color-mix(in srgb, var(--olive-mid) 10%, transparent)",
              color: "var(--foreground)",
            }}
          >
            &ldquo;{quote}&rdquo;
          </blockquote>

          {/* CTA */}
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl text-sm transition-all active:scale-95"
            style={{ backgroundColor: "var(--olive-mid)", color: "#FAF6F0" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--olive-light)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--olive-mid)")}
          >
            Got it — let&apos;s keep going! <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
