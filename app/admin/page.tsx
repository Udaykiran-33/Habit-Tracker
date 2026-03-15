"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Flame,
  Lock,
  Eye,
  EyeOff,
  MessageSquare,
  Lightbulb,
  Wrench,
  Bug,
  HelpCircle,
  Search,
  Filter,
  CalendarDays,
  Users,
  TrendingUp,
  LogOut,
  ChevronDown,
  ChevronUp,
  Coins,
  Plus,
  Minus,
  Save,
} from "lucide-react";

/* ─── Types ─── */
interface FeedbackItem {
  _id: string;
  userName: string;
  userEmail: string;
  message: string;
  category: string;
  createdAt: string;
}

interface UserItem {
  _id: string;
  name: string;
  email: string;
  coins: number;
  createdAt: string;
}


const CATEGORY_META: Record<
  string,
  { label: string; icon: typeof Lightbulb; color: string; bg: string }
> = {
  feature_request: {
    label: "Feature Request",
    icon: Lightbulb,
    color: "#8baf48",
    bg: "rgba(139,175,72,.12)",
  },
  improvement: {
    label: "Improvement",
    icon: Wrench,
    color: "#e2a63d",
    bg: "rgba(226,166,61,.12)",
  },
  bug: {
    label: "Bug Report",
    icon: Bug,
    color: "#e25c5c",
    bg: "rgba(226,92,92,.12)",
  },
  other: {
    label: "Other",
    icon: HelpCircle,
    color: "#7c8a9e",
    bg: "rgba(124,138,158,.12)",
  },
};

/* ─── Admin Page Component ─── */
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<"feedback" | "users">("feedback");

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ─── Users state ─── */
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editCoins, setEditCoins] = useState(0);
  const [savingCoins, setSavingCoins] = useState(false);

  /* ─── Auth ─── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return setLoginError("Password is required");
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthed(true);
      } else {
        setLoginError("Invalid password");
      }
    } catch {
      setLoginError("Something went wrong");
    } finally {
      setLoginLoading(false);
    }
  };

  /* ─── Fetch feedback ─── */
  useEffect(() => {
    if (!authed) return;
    (async () => {
      try {
        const res = await fetch("/api/feedback");
        const data = await res.json();
        setFeedbacks(data.feedbacks || []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [authed]);

  /* ─── Fetch users ─── */
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      /* ignore */
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (authed && activeTab === "users") {
      fetchUsers();
    }
  }, [authed, activeTab]);

  /* ─── Save coins ─── */
  const handleSaveCoins = async (userId: string) => {
    setSavingCoins(true);
    try {
      const res = await fetch("/api/admin/users/coins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, coins: editCoins }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, coins: editCoins } : u
          )
        );
        setEditingUserId(null);
      }
    } catch {
      /* ignore */
    } finally {
      setSavingCoins(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  /* ─── Derived data ─── */
  const todayStr = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const todayCount = feedbacks.filter(
      (f) => f.createdAt.slice(0, 10) === todayStr
    ).length;
    const featureCount = feedbacks.filter(
      (f) => f.category === "feature_request"
    ).length;
    const bugCount = feedbacks.filter((f) => f.category === "bug").length;
    const uniqueUsers = new Set(feedbacks.map((f) => f.userEmail)).size;
    return {
      total: feedbacks.length,
      today: todayCount,
      features: featureCount,
      bugs: bugCount,
      users: uniqueUsers,
    };
  }, [feedbacks, todayStr]);

  const filtered = useMemo(() => {
    let list = [...feedbacks];
    if (catFilter !== "all") list = list.filter((f) => f.category === catFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          f.userName.toLowerCase().includes(q) ||
          f.userEmail.toLowerCase().includes(q) ||
          f.message.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return list;
  }, [feedbacks, catFilter, search, sortOrder]);

  /* ────────── LOGIN SCREEN ────────── */
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors" style={{ backgroundColor: "var(--background)" }}>
        {/* Background accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[var(--olive-mid)]/5 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[var(--surface-2)]/30 rounded-full blur-[120px]" />
        </div>

        <div className="relative w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-11 h-11 flex items-center justify-center" style={{ borderRadius: "8px", overflow: "hidden" }}>
              <img src="/logo.png" alt="UrHabit Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-2xl tracking-tight transition-colors" style={{ color: "var(--foreground)" }}>
              Ur<span className="transition-colors" style={{ color: "var(--olive-light)" }}>Habit</span>
            </span>
          </div>

          {/* Login Card */}
          <div className="border rounded-2xl p-6 sm:p-8 shadow-2xl transition-colors" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[var(--olive-mid)]/15 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Lock size={20} className="transition-colors" style={{ color: "var(--olive-light)" }} />
              </div>
              <h1 className="text-xl font-bold transition-colors" style={{ color: "var(--foreground)" }}>Admin Portal</h1>
              <p className="text-sm mt-1 transition-colors" style={{ color: "var(--muted)" }}>
                Enter the admin password to continue
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block transition-colors" style={{ color: "var(--foreground)" }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "var(--muted)" }}>
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLoginError("");
                    }}
                    placeholder="Enter admin password"
                    className="w-full border rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-[var(--olive-light)] focus:ring-1 focus:ring-[var(--olive-light)] transition-colors"
                    style={{ 
                      backgroundColor: "var(--background)", 
                      borderColor: "var(--border)",
                      color: "var(--foreground)"
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "var(--muted)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginError && (
                  <p className="text-xs text-red-500 mt-1.5">{loginError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: "var(--olive-mid)", color: "#FAF6F0" }}
                onMouseEnter={(e) => !loginLoading && (e.currentTarget.style.backgroundColor = "var(--olive-light)")}
                onMouseLeave={(e) => !loginLoading && (e.currentTarget.style.backgroundColor = "var(--olive-mid)")}
              >
                {loginLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Verifying…
                  </>
                ) : (
                  "Access Admin Panel"
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-[10px] mt-6 transition-colors" style={{ color: "var(--muted)" }}>
            UrHabit Admin • Restricted Access
          </p>
        </div>
      </div>
    );
  }

  /* ────────── ADMIN DASHBOARD ────────── */
  return (
    <div className="min-h-screen transition-colors" style={{ backgroundColor: "var(--background)" }}>
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-lg border-b transition-colors" style={{ backgroundColor: "color-mix(in srgb, var(--surface) 90%, transparent)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center" style={{ borderRadius: "8px", overflow: "hidden" }}>
              <img src="/logo.png" alt="UrHabit Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg tracking-tight transition-colors" style={{ color: "var(--foreground)" }}>
              Ur<span className="transition-colors" style={{ color: "var(--olive-light)" }}>Habit</span>
            </span>
            <span className="text-xs font-medium ml-1 hidden sm:inline transition-colors" style={{ color: "var(--muted)" }}>
              / Admin
            </span>
          </div>
          <button
            onClick={() => {
              setAuthed(false);
              setPassword("");
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:text-red-500 hover:bg-red-500/10"
            style={{ color: "var(--muted)" }}
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tabs */}
        <div className="flex gap-1 p-1 border rounded-xl mb-6 sm:mb-8 w-fit" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          {(["feedback", "users"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={{
                backgroundColor: activeTab === tab ? "var(--olive-mid)" : "transparent",
                color: activeTab === tab ? "#FAF6F0" : "var(--muted)",
              }}
            >
              {tab === "feedback" ? <MessageSquare size={14} /> : <Users size={14} />}
              {tab === "feedback" ? "Feedback" : "Users"}
            </button>
          ))}
        </div>

        {activeTab === "feedback" && (
        <>
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold transition-colors" style={{ color: "var(--foreground)" }}>
            Feedback Dashboard
          </h1>
          <p className="text-sm mt-1 transition-colors" style={{ color: "var(--muted)" }}>
            Manage and review user feedback
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            {
              label: "Total Feedback",
              value: stats.total,
              icon: MessageSquare,
              color: "#8baf48",
            },
            {
              label: "Today",
              value: stats.today,
              icon: CalendarDays,
              color: "#e2a63d",
            },
            {
              label: "Feature Requests",
              value: stats.features,
              icon: Lightbulb,
              color: "#6b8c3a",
            },
            {
              label: "Bug Reports",
              value: stats.bugs,
              icon: Bug,
              color: "#e25c5c",
            },
            {
              label: "Unique Users",
              value: stats.users,
              icon: Users,
              color: "#7c8a9e",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="border rounded-xl p-3 sm:p-4 transition-all group hover:border-[var(--muted)]"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${s.color}15` }}
                  >
                    <Icon size={15} style={{ color: s.color }} />
                  </div>
                  <TrendingUp size={12} className="transition-colors" style={{ color: "var(--muted)" }} />
                </div>
                <p className="text-lg sm:text-2xl font-bold transition-colors" style={{ color: "var(--foreground)" }}>
                  {s.value}
                </p>
                <p className="text-[10px] sm:text-xs mt-0.5 transition-colors" style={{ color: "var(--muted)" }}>
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "var(--muted)" }}
            />
            <input
              type="text"
              placeholder="Search by name, email, or message…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--olive-light)] transition-colors"
              style={{ 
                backgroundColor: "var(--surface)", 
                borderColor: "var(--border)",
                color: "var(--foreground)"
              }}
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="flex-shrink-0 transition-colors" style={{ color: "var(--muted)" }} />
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--olive-light)] cursor-pointer transition-colors"
              style={{ 
                backgroundColor: "var(--surface)", 
                borderColor: "var(--border)",
                color: "var(--foreground)"
              }}
            >
              <option value="all">All Categories</option>
              <option value="feature_request">Feature Requests</option>
              <option value="improvement">Improvements</option>
              <option value="bug">Bug Reports</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Sort */}
          <button
            onClick={() =>
              setSortOrder((o) => (o === "newest" ? "oldest" : "newest"))
            }
            className="flex items-center gap-1.5 px-3 py-2.5 border rounded-xl text-sm transition-all flex-shrink-0 hover:border-[var(--muted)]"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--muted)" }}
          >
            {sortOrder === "newest" ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronUp size={14} />
            )}
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </button>
        </div>

        {/* Results count */}
        <p className="text-xs mb-4 transition-colors" style={{ color: "var(--muted)" }}>
          Showing {filtered.length} of {feedbacks.length} feedback entries
        </p>

        {/* Feedback Cards */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="border rounded-xl p-5 animate-pulse transition-colors"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full" style={{ backgroundColor: "var(--surface-2)" }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 rounded w-1/4" style={{ backgroundColor: "var(--surface-2)" }} />
                    <div className="h-2 rounded w-1/6" style={{ backgroundColor: "var(--surface-2)" }} />
                  </div>
                  <div className="h-5 rounded-full w-20" style={{ backgroundColor: "var(--surface-2)" }} />
                </div>
                <div className="h-2 rounded w-3/4 mb-2" style={{ backgroundColor: "var(--surface-2)" }} />
                <div className="h-2 rounded w-1/2" style={{ backgroundColor: "var(--surface-2)" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed rounded-xl p-12 text-center transition-colors" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
            <MessageSquare
              size={32}
              className="mx-auto mb-3 transition-colors"
              style={{ color: "var(--muted)" }}
            />
            <p className="text-sm transition-colors" style={{ color: "var(--muted)" }}>
              {feedbacks.length === 0
                ? "No feedback received yet"
                : "No feedback matches your filters"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((fb) => {
              const cat = CATEGORY_META[fb.category] || CATEGORY_META.other;
              const CatIcon = cat.icon;
              const isExpanded = expandedId === fb._id;
              const isLong = fb.message.length > 200;
              const initials = fb.userName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={fb._id}
                  className="border rounded-xl p-4 sm:p-5 transition-all"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--muted)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  {/* Header row */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-[var(--olive-mid)]/15 flex items-center justify-center text-[var(--olive-light)] text-xs font-bold flex-shrink-0">
                      {initials}
                    </div>

                    {/* Name + email + date */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate transition-colors" style={{ color: "var(--foreground)" }}>
                        {fb.userName}
                      </p>
                      <p className="text-[10px] truncate transition-colors" style={{ color: "var(--muted)" }}>
                        {fb.userEmail}
                      </p>
                    </div>

                    {/* Category badge */}
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium flex-shrink-0"
                      style={{ color: cat.color, backgroundColor: cat.bg }}
                    >
                      <CatIcon size={11} />
                      <span className="hidden sm:inline">{cat.label}</span>
                    </div>
                  </div>

                  {/* Message body */}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap transition-colors" style={{ color: "var(--foreground)" }}>
                    {isLong && !isExpanded
                      ? fb.message.slice(0, 200) + "…"
                      : fb.message}
                  </p>
                  {isLong && (
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : fb._id)
                      }
                      className="text-xs hover:underline mt-1 transition-colors"
                      style={{ color: "var(--olive-light)" }}
                    >
                      {isExpanded ? "Show less" : "Read more"}
                    </button>
                  )}

                  {/* Footer */}
                  <div className="flex items-center gap-1.5 mt-3 text-[10px] transition-colors" style={{ color: "var(--muted)" }}>
                    <CalendarDays size={10} />
                    {new Date(fb.createdAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </>
        )}

        {activeTab === "users" && (
        <>
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold transition-colors" style={{ color: "var(--foreground)" }}>
              User Management
            </h1>
            <p className="text-sm mt-1 transition-colors" style={{ color: "var(--muted)" }}>
              View all users and manage their U coin balance
            </p>
          </div>

          {/* Users Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {[
              { label: "Total Users", value: users.length, icon: Users, color: "#8baf48" },
              { label: "Total Coins in Circulation", value: users.reduce((sum, u) => sum + (u.coins || 0), 0), icon: Coins, color: "#e2a63d" },
              { label: "Users with 0 Coins", value: users.filter((u) => (u.coins || 0) === 0).length, icon: HelpCircle, color: "#e25c5c" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="border rounded-xl p-3 sm:p-4 transition-all group hover:border-[var(--muted)]"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${s.color}15` }}
                    >
                      <Icon size={15} style={{ color: s.color }} />
                    </div>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold transition-colors" style={{ color: "var(--foreground)" }}>
                    {s.value}
                  </p>
                  <p className="text-[10px] sm:text-xs mt-0.5 transition-colors" style={{ color: "var(--muted)" }}>
                    {s.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* User Search */}
          <div className="relative mb-4">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "var(--muted)" }}
            />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--olive-light)] transition-colors"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>

          <p className="text-xs mb-4 transition-colors" style={{ color: "var(--muted)" }}>
            Showing {filteredUsers.length} of {users.length} users
          </p>

          {/* Users Table */}
          {usersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="border rounded-xl p-5 animate-pulse transition-colors"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full" style={{ backgroundColor: "var(--surface-2)" }} />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 rounded w-1/4" style={{ backgroundColor: "var(--surface-2)" }} />
                      <div className="h-2 rounded w-1/6" style={{ backgroundColor: "var(--surface-2)" }} />
                    </div>
                    <div className="h-8 rounded-lg w-20" style={{ backgroundColor: "var(--surface-2)" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="border border-dashed rounded-xl p-12 text-center transition-colors" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              <Users size={32} className="mx-auto mb-3 transition-colors" style={{ color: "var(--muted)" }} />
              <p className="text-sm transition-colors" style={{ color: "var(--muted)" }}>
                {users.length === 0 ? "No users found" : "No users match your search"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => {
                const initials = user.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                const isEditing = editingUserId === user._id;

                return (
                  <div
                    key={user._id}
                    className="border rounded-xl p-4 sm:p-5 transition-all"
                    style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--muted)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-[var(--olive-mid)]/15 flex items-center justify-center text-[var(--olive-light)] text-xs font-bold flex-shrink-0">
                        {initials}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate transition-colors" style={{ color: "var(--foreground)" }}>
                          {user.name}
                        </p>
                        <p className="text-[10px] truncate transition-colors" style={{ color: "var(--muted)" }}>
                          {user.email}
                        </p>
                        <p className="text-[10px] mt-0.5 transition-colors" style={{ color: "var(--muted)" }}>
                          Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>

                      {/* Coin Section */}
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditCoins(Math.max(0, editCoins - 1))}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/10"
                            style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-lg font-bold min-w-[2rem] text-center" style={{ color: "var(--foreground)" }}>
                            {editCoins}
                          </span>
                          <button
                            onClick={() => setEditCoins(editCoins + 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-green-500/10"
                            style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => handleSaveCoins(user._id)}
                            disabled={savingCoins}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-1.5"
                            style={{ backgroundColor: "var(--olive-mid)", color: "#FAF6F0" }}
                          >
                            <Save size={12} />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{ color: "var(--muted)" }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUserId(user._id);
                            setEditCoins(user.coins || 0);
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all hover:border-[var(--olive-light)]" 
                          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                        >
                          🪙 {user.coins || 0}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
        )}
      </div>
    </div>
  );

}
