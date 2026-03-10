"use client";
import { useEffect, useState } from "react";

interface LevelUpPopupProps {
  level: number;
  title: string;
  show: boolean;
  onClose: () => void;
}

export default function LevelUpPopup({ level, title, show, onClose }: LevelUpPopupProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Small delay to trigger CSS animation
      requestAnimationFrame(() => setAnimating(true));

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setAnimating(false);
        setTimeout(() => {
          setVisible(false);
          onClose();
        }, 400);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={() => {
        setAnimating(false);
        setTimeout(() => { setVisible(false); onClose(); }, 400);
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-400"
        style={{ opacity: animating ? 1 : 0 }}
      />

      {/* Card */}
      <div
        className="relative z-10 border-2 rounded-2xl p-8 sm:p-10 text-center max-w-sm w-full shadow-2xl transition-all duration-500"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--olive-mid)",
          opacity: animating ? 1 : 0,
          transform: animating ? "scale(1) translateY(0)" : "scale(0.8) translateY(40px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none transition-colors" style={{
          boxShadow: `0 0 60px color-mix(in srgb, var(--olive-mid) 30%, transparent), 
                      0 0 120px color-mix(in srgb, var(--olive-mid) 10%, transparent), 
                      inset 0 0 1px color-mix(in srgb, var(--olive-light) 40%, transparent)`,
        }} />

        {/* Badge */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5">
          <div 
            className="absolute inset-0 rounded-full animate-ping" 
            style={{ backgroundColor: "color-mix(in srgb, var(--olive-mid) 20%, transparent)" }}
          />
          <div 
            className="relative w-full h-full rounded-full flex items-center justify-center border-4"
            style={{ backgroundColor: "var(--olive-mid)", borderColor: "var(--olive-light)" }}
          >
            <span className="text-3xl sm:text-4xl font-black text-[#FAF6F0]">{level}</span>
          </div>
        </div>

        {/* Sparkles */}
        <div className="text-3xl mb-2">🎉</div>

        <h2 className="text-xl sm:text-2xl font-black mb-1" style={{ color: "var(--foreground)" }}>
          Level Up!
        </h2>
        <p className="font-bold text-sm mb-3" style={{ color: "var(--olive-light)" }}>
          You reached Level {level} — {title}
        </p>
        <p className="text-xs leading-relaxed mb-6" style={{ color: "var(--muted)" }}>
          Keep crushing your habits to unlock the next level and earn more badges!
        </p>

        <button
          onClick={() => {
            setAnimating(false);
            setTimeout(() => { setVisible(false); onClose(); }, 400);
          }}
          className="font-bold text-sm px-6 py-2.5 rounded-full transition-colors"
          style={{ backgroundColor: "var(--olive-mid)", color: "#FAF6F0" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--olive-light)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--olive-mid)")}
        >
          Keep Going! 🔥
        </button>
      </div>
    </div>
  );
}
