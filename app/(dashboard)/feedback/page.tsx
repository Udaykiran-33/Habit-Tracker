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
          <div className="w-10 h-10 bg-[#6b8c3a]/20 rounded-xl flex items-center justify-center">
            <MessageSquarePlus size={20} className="text-[#8baf48]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#FAF6F0]">
            Share Your Feedback
          </h1>
        </div>
        <p className="text-[#9F9A8C] text-sm leading-relaxed mt-2">
          What feature do you need in the website? What changes should be made to
          make it more impressive? We&apos;d love to hear from you!
        </p>
      </div>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category Selector */}
        <div>
          <label className="text-sm font-medium text-[#FAF6F0] mb-3 block">
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
                    active
                      ? "border-[#6b8c3a] bg-[#6b8c3a]/15 text-[#8baf48]"
                      : "border-[#2D2D2A] bg-[#1A1A1A] text-[#9F9A8C] hover:border-[#3D3D3A]"
                  }`}
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
          <label className="text-sm font-medium text-[#FAF6F0] mb-2 block">
            Your Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the feature you'd like, a bug you found, or any suggestions to improve UrHabit…"
            rows={5}
            className="w-full bg-[#1A1A1A] border border-[#2D2D2A] rounded-xl px-4 py-3 text-sm text-[#FAF6F0] placeholder:text-[#6B665A] focus:outline-none focus:border-[#6b8c3a] focus:ring-1 focus:ring-[#6b8c3a] transition-colors resize-none"
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
      <div className="border-t border-[#2D2D2A] my-8" />

      {/* Past Feedback */}
      <div>
        <h2 className="font-semibold text-sm sm:text-base text-[#FAF6F0] mb-4">
          Your Past Feedback
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-[#1A1A1A] border border-[#2D2D2A] rounded-xl p-4 animate-pulse"
              >
                <div className="h-3 bg-[#2D2D2A] rounded w-1/4 mb-3" />
                <div className="h-2 bg-[#2D2D2A] rounded w-3/4 mb-2" />
                <div className="h-2 bg-[#2D2D2A] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : myFeedback.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#2D2D2A] border-dashed rounded-xl p-8 text-center">
            <MessageSquarePlus size={28} className="text-[#3D3D3A] mx-auto mb-2" />
            <p className="text-[#9F9A8C] text-sm">
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
                  className="bg-[#1A1A1A] border border-[#2D2D2A] rounded-xl p-4 transition-all hover:border-[#3D3D3A]"
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
                    <div className="flex items-center gap-1 text-[10px] text-[#6B665A]">
                      <Clock size={10} />
                      {new Date(fb.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <p className="text-sm text-[#C8C3B8] leading-relaxed">
                    {fb.message}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#6b8c3a]">
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
          <div className="relative bg-[#1A1A1A] border border-[#2D2D2A] rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-[fadeInUp_0.35s_ease-out]">
            {/* Close */}
            <button
              onClick={() => setShowSuccess(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-[#6B665A] hover:text-[#9F9A8C] hover:bg-[#222222] transition-colors"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="w-16 h-16 bg-[#6b8c3a]/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-[#8baf48]" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#e2a63d]/20 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles size={12} className="text-[#e2a63d]" />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#FAF6F0] mb-2">
                Thank You! 🎉
              </h3>
              <p className="text-sm text-[#9F9A8C] leading-relaxed mb-1">
                We truly appreciate your interest in making UrHabit better.
              </p>
              <p className="text-sm text-[#C8C3B8] leading-relaxed">
                Your feedback has been received and we will work on implementing
                changes based on your suggestions.
              </p>
            </div>

            {/* Heart accent */}
            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-[#6b8c3a]">
              <Heart size={12} className="fill-[#6b8c3a]" />
              <span>Your voice shapes UrHabit</span>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full mt-5 bg-[#6b8c3a] hover:bg-[#7a9e43] text-[#FAF6F0] font-medium py-2.5 rounded-xl transition-all text-sm"
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
