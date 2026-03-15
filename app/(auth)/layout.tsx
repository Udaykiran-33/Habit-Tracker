import { Flame } from "lucide-react";
import SessionWrapper from "@/components/providers/SessionWrapper";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionWrapper>
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-sidebar-bg border-r border-sidebar-border p-12 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-olive-bg via-transparent to-transparent" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-olive/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-olive-dark/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/logo.png" alt="UrHabit Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-foreground font-bold text-2xl tracking-tight">
              Ur<span className="text-olive-light">Habit</span>
            </span>
          </div>

          {/* Content */}
          <div className="mt-auto mb-16">
            <h1 className="text-4xl font-bold text-foreground leading-tight mb-4">
              Build <span className="text-olive-light">discipline</span>,<br />
              one day at a time.
            </h1>
            <p className="text-muted text-lg leading-relaxed max-w-sm">
              Track habits, maintain streaks, earn achievements and gain AI
              insights to become your best self.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[
                { v: "🔥", label: "Streak tracking" },
                { v: "📊", label: "Progress charts" },
                { v: "🏆", label: "Achievements" },
              ].map(({ v, label }) => (
                <div
                  key={label}
                  className="bg-surface border border-border rounded-xl p-4 text-center"
                >
                  <div className="text-2xl mb-1">{v}</div>
                  <p className="text-xs text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
    </SessionWrapper>
  );
}
