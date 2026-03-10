"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  MessageSquarePlus,
  Send,
  Lightbulb,
  Wrench,
  Bug,
  HelpCircle,
  CheckCircle2,
  Clock,
  X,
  Sparkles,
  Heart,
} from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "feature_request", label: "Feature Request", icon: Lightbulb, color: "#8baf48" },
  { value: "improvement", label: "Improvement", icon: Wrench, color: "#e2a63d" },
  { value: "bug", label: "Bug Report", icon: Bug, color: "#e25c5c" },
  { value: "other", label: "Other", icon: HelpCircle, color: "#7c8a9e" },
];

interface FeedbackItem {
  _id: string;
  message: string;
  category: string;
  createdAt: string;
}

export default function FeedbackPage() {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("feature_request");
  const [submitting, setSubmitting] = useState(false);
  const [myFeedback, setMyFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchMyFeedback = async () => {
    try {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      // Filter only current user's feedback
      const mine = (data.feedbacks || []).filter(
        (f: { userEmail: string }) => f.userEmail === session?.user?.email
      );
      setMyFeedback(mine);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) fetchMyFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter your feedback");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, category }),
      });
      if (res.ok) {
        setMessage("");
        setCategory("feature_request");
        setShowSuccess(true);
        fetchMyFeedback();
      } else {
        toast.error("Failed to submit feedback");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryInfo = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat) || CATEGORIES[3];

  return (
    <>
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: "color-mix(in srgb, var(--olive-mid) 20%, transparent)" }}>
            <MessageSquarePlus size={20} className="transition-colors" style={{ color: "var(--olive-light)" }} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold transition-colors" style={{ color: "var(--foreground)" }}>
            Share Your Feedback
          </h1>
        </div>
        <p className="text-sm leading-relaxed mt-2 transition-colors" style={{ color: "var(--muted)" }}>
          What feature do you need in the website? What changes should be made to
          make it more impressive? We&apos;d love to hear from you!
        </p>
      </div>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category Selector */}
        <div>
          <label className="text-sm font-medium mb-3 block transition-colors" style={{ color: "var(--foreground)" }}>
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                    active ? "" : "hover:border-[var(--olive-light)]"
                  }`}
                  style={active ? {
                    backgroundColor: "color-mix(in srgb, var(--olive-mid) 15%, transparent)",
                    borderColor: "var(--olive-mid)",
                    color: "var(--olive-light)"
                  } : {
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--muted)"
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--muted)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                    }
                  }}
                >
                  <Icon size={14} style={{ color: active ? cat.color : undefined }} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Textarea */}
        <div>
          <label className="text-sm font-medium mb-2 block transition-colors" style={{ color: "var(--foreground)" }}>
            Your Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the feature you'd like, a bug you found, or any suggestions to improve UrHabit…"
            rows={5}
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--olive-light)] focus:ring-1 focus:ring-[var(--olive-light)] transition-colors resize-none"
            style={{ 
              backgroundColor: "var(--surface)", 
              borderColor: "var(--border)",
              color: "var(--foreground)"
            }}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={submitting}
        >
          <Send size={16} /> Submit Feedback
        </Button>
      </form>

      {/* Divider */}
      <div className="border-t my-8 transition-colors" style={{ borderColor: "var(--border)" }} />

      {/* Past Feedback */}
      <div>
        <h2 className="font-semibold text-sm sm:text-base mx-4 ml-0 mb-4 transition-colors" style={{ color: "var(--foreground)" }}>
          Your Past Feedback
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="border rounded-xl p-4 animate-pulse transition-colors"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div className="h-3 rounded w-1/4 mb-3" style={{ backgroundColor: "var(--surface-2)" }} />
                <div className="h-2 rounded w-3/4 mb-2" style={{ backgroundColor: "var(--surface-2)" }} />
                <div className="h-2 rounded w-1/2" style={{ backgroundColor: "var(--surface-2)" }} />
              </div>
            ))}
          </div>
        ) : myFeedback.length === 0 ? (
          <div className="border border-dashed rounded-xl p-8 text-center transition-colors" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
            <MessageSquarePlus size={28} className="mx-auto mb-2 transition-colors" style={{ color: "var(--muted)" }} />
            <p className="text-sm transition-colors" style={{ color: "var(--muted)" }}>
              No feedback submitted yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myFeedback.map((fb) => {
              const catInfo = getCategoryInfo(fb.category);
              const CatIcon = catInfo.icon;
              return (
                <div
                  key={fb._id}
                  className="border rounded-xl p-4 transition-all"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--muted)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CatIcon size={13} style={{ color: catInfo.color }} />
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          color: catInfo.color,
                          backgroundColor: `${catInfo.color}15`,
                        }}
                      >
                        {catInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] transition-colors" style={{ color: "var(--muted)" }}>
                      <Clock size={10} />
                      {new Date(fb.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed transition-colors" style={{ color: "var(--foreground)" }}>
                    {fb.message}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] transition-colors" style={{ color: "var(--olive-mid)" }}>
                    <CheckCircle2 size={10} />
                    Submitted successfully
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
      {/* ─── Success Popup Modal ─── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSuccess(false)}
          />

          {/* Modal */}
          <div className="relative border rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-[fadeInUp_0.35s_ease-out] transition-colors" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
            {/* Close */}
            <button
              onClick={() => setShowSuccess(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--foreground)";
                e.currentTarget.style.backgroundColor = "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--muted)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: "color-mix(in srgb, var(--olive-mid) 20%, transparent)" }}>
                  <CheckCircle2 size={32} className="transition-colors" style={{ color: "var(--olive-light)" }} />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center animate-bounce transition-colors" style={{ backgroundColor: "color-mix(in srgb, #e2a63d 20%, transparent)" }}>
                  <Sparkles size={12} style={{ color: "#e2a63d" }} />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2 transition-colors" style={{ color: "var(--foreground)" }}>
                Thank You! 🎉
              </h3>
              <p className="text-sm leading-relaxed mb-1 transition-colors" style={{ color: "var(--muted)" }}>
                We truly appreciate your interest in making UrHabit better.
              </p>
              <p className="text-sm leading-relaxed transition-colors" style={{ color: "var(--foreground)" }}>
                Your feedback has been received and we will work on implementing
                changes based on your suggestions.
              </p>
            </div>

            {/* Heart accent */}
            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs transition-colors" style={{ color: "var(--olive-mid)" }}>
              <Heart size={12} className="transition-colors" style={{ fill: "var(--olive-mid)" }} />
              <span>Your voice shapes UrHabit</span>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full mt-5 font-medium py-2.5 rounded-xl transition-all text-sm"
              style={{ backgroundColor: "var(--olive-mid)", color: "#FAF6F0" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--olive-light)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--olive-mid)")}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
