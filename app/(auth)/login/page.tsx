"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Flame } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else if (result?.ok) {
        toast.success("Welcome back!");
        window.location.href = "/dashboard";
        return;
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Mobile logo */}
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="w-8 h-8 bg-[#6b8c3a] rounded-lg flex items-center justify-center">
          <Flame size={16} className="text-[#FAF6F0]" />
        </div>
        <span className="text-[#FAF6F0] font-bold text-xl">
          Ur<span className="text-[#8baf48]">Habit</span>
        </span>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#FAF6F0]">Welcome back</h2>
        <p className="text-[#9F9A8C] mt-1 text-sm">
          Sign in to continue your streak
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          icon={<Mail size={16} />}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          icon={<Lock size={16} />}
          required
        />

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2"
          loading={loading}
        >
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-[#9F9A8C] mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-[#8baf48] hover:underline font-medium"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
