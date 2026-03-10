"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Flame } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 8) e.password = "Min 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Registration failed");
        return;
      }

      const result = await signIn("credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (result?.ok) {
        toast.success("Account created! Welcome to UrHabit 🔥");
        router.refresh();
        router.push("/dashboard");
      } else {
        toast.success("Account created! Please sign in.");
        router.push("/login");
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
        <div className="w-8 h-8 bg-olive rounded-lg flex items-center justify-center">
          <Flame size={16} className="text-white" />
        </div>
        <span className="text-foreground font-bold text-xl">
          Ur<span className="text-olive-light">Habit</span>
        </span>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Start your journey</h2>
        <p className="text-muted mt-1 text-sm">
          Create your account and begin tracking today
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Uday Kiran"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          icon={<User size={16} />}
          error={errors.name}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          icon={<Mail size={16} />}
          error={errors.email}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min 8 characters"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          icon={<Lock size={16} />}
          error={errors.password}
          required
        />

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2"
          loading={loading}
        >
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-olive-light hover:underline font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
