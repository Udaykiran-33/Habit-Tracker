"use client";

import { Flame, BarChart2, Trophy } from "lucide-react";
import SessionWrapper from "@/components/providers/SessionWrapper";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Glow pulse animation for background shapes
      gsap.to(".bg-shape-1", {
        x: 30,
        y: 20,
        scale: 1.05,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      gsap.to(".bg-shape-2", {
        x: -30,
        y: -20,
        scale: 1.05,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Left panel staggered sequence
      gsap.from(".animate-item", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2
      });

      // Right panel form entrance
      gsap.from(".form-container", {
        opacity: 0,
        x: 30,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.4
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <SessionWrapper>
      <div ref={containerRef} className="min-h-screen bg-background flex selection:bg-olive selection:text-white">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col w-1/2 bg-sidebar-bg border-r border-sidebar-border p-12 relative overflow-hidden">
          {/* Animated Background gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-olive-bg via-transparent to-sidebar-bg opacity-90" />
          <div className="bg-shape-1 absolute -top-40 -left-40 w-[600px] h-[600px] bg-olive/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="bg-shape-2 absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-olive-dark/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full">
            {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-olive rounded-xl flex items-center justify-center">
              <Flame size={20} className="text-white" />
              </div>
            <span className="text-foreground font-bold text-2xl tracking-tight">
                Ur<span className="text-olive-light">Habit</span>
              </span>
            </div>

            {/* Content */}
            <div className="mt-auto mb-16">
              <h1 className="animate-item text-5xl font-extrabold text-foreground leading-[1.2] mb-6">
                Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-olive to-olive-light">discipline</span>,<br />
                one day at a time.
              </h1>
              <p className="animate-item text-muted text-xl leading-relaxed max-w-md">
                Track habits, maintain streaks, earn achievements and gain AI insights to become your best self.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-12 w-full max-w-lg">
                {[
                  { icon: Flame, label: "Streak tracking", color: "text-orange-500" },
                  { icon: BarChart2, label: "Progress charts", color: "text-blue-500" },
                  { icon: Trophy, label: "Achievements", color: "text-yellow-500" },
                ].map(({ icon: Icon, label, color }) => (
                  <div
                    key={label}
                    className="animate-item group relative bg-surface border border-border rounded-2xl p-5 text-center transition-all duration-300 hover:border-olive/50 hover:-translate-y-2 hover:shadow-xl hover:shadow-olive/10 cursor-default"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-olive/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                    <div className={`mb-3 flex justify-center origin-center ${color}`}>
                      <Icon size={32} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-semibold text-muted group-hover:text-foreground transition-colors duration-300">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel form area */}
        <div className="flex-1 flex items-center justify-center p-8 relative form-container">
          <div className="w-full max-w-md relative z-10 transition-all duration-300 space-y-8">
            {children}
          </div>
        </div>
      </div>
    </SessionWrapper>
  );
}
