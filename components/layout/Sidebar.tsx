"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0d0d0d] border-b border-[#1e1e1e] flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#6b8c3a] rounded-lg flex items-center justify-center">
            <Flame size={14} className="text-white" />
          </div>
          <span className="text-[#f5f5f5] font-bold text-base tracking-tight">
            Ur<span className="text-[#8baf48]">Habit</span>
          </span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-lg text-[#888] hover:text-[#f5f5f5] hover:bg-[#1c1c1c] transition-colors"
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
          "fixed left-0 top-0 h-screen w-60 bg-[#0d0d0d] border-r border-[#1e1e1e] flex flex-col z-40 transition-transform duration-300",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-[#1e1e1e]">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[#6b8c3a] rounded-lg flex items-center justify-center">
              <Flame size={16} className="text-white" />
            </div>
            <span className="text-[#f5f5f5] font-bold text-lg tracking-tight">
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
                    : "text-[#888] hover:text-[#f5f5f5] hover:bg-[#1c1c1c]"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-[#1e1e1e]">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#888] hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
