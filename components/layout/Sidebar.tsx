"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  BarChart2,
  Calendar,
  Trophy,
  LogOut,
  Flame,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/habits", label: "Habits", icon: CheckSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/achievements", label: "Achievements", icon: Trophy },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/login", redirect: true });
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#151515] border-b border-[#2D2D2A] flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#6b8c3a] rounded-lg flex items-center justify-center">
            <Flame size={14} className="text-[#FAF6F0]" />
          </div>
          <span className="text-[#FAF6F0] font-bold text-base tracking-tight">
            Ur<span className="text-[#8baf48]">Habit</span>
          </span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-lg text-[#9F9A8C] hover:text-[#FAF6F0] hover:bg-[#222222] transition-colors"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-60 bg-[#151515] border-r border-[#2D2D2A] flex flex-col z-40 transition-transform duration-300",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-[#2D2D2A]">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[#6b8c3a] rounded-lg flex items-center justify-center">
              <Flame size={16} className="text-[#FAF6F0]" />
            </div>
            <span className="text-[#FAF6F0] font-bold text-lg tracking-tight">
              Ur<span className="text-[#8baf48]">Habit</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-[#6b8c3a]/20 text-[#8baf48] border border-[#6b8c3a]/30"
                    : "text-[#9F9A8C] hover:text-[#FAF6F0] hover:bg-[#222222]"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-[#2D2D2A]">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#9F9A8C] hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-wait"
          >
            <LogOut size={16} />
            {signingOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </aside>
    </>
  );
}
