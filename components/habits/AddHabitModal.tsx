"use client";
import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { cn, HABIT_CATEGORIES } from "@/lib/utils";
import toast from "react-hot-toast";

interface HabitFormData {
  name: string;
  category: string;
  frequency: string;
  color: string;
}

interface Habit extends HabitFormData {
  id: string;
}

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Partial<Habit>) => Promise<void>;
  editHabit?: Habit | null;
}

const FREQUENCIES = ["Daily", "Weekly", "3x per week"];

export default function AddHabitModal({
  isOpen,
  onClose,
  onSave,
  editHabit,
}: AddHabitModalProps) {
  const [form, setForm] = useState<HabitFormData>({
    name: "",
    category: "General",
    frequency: "Daily",
    color: "#6b8c3a",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editHabit) {
      setForm({
        name: editHabit.name,
        category: editHabit.category,
        frequency: editHabit.frequency,
        color: editHabit.color,
      });
    } else {
      setForm({ name: "", category: "General", frequency: "Daily", color: "#6b8c3a" });
    }
  }, [editHabit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Habit name is required");
      return;
    }
    setLoading(true);
    try {
      await onSave(editHabit ? { ...form, id: editHabit.id } : form);
      onClose();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editHabit ? "Edit Habit" : "Create New Habit"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Habit Name"
          placeholder="e.g. Morning run, Read 20 pages…"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          autoFocus
        />

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive"
          >
            {HABIT_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-surface-2">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Frequency */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Frequency</label>
          <div className="flex flex-wrap gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setForm((s) => ({ ...s, frequency: f }))}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  form.frequency === f
                    ? "bg-olive/20 border-olive text-olive-light"
                    : "bg-surface-2 border-border text-muted hover:border-border-hover"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>


        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1" loading={loading}>
            {editHabit ? "Save Changes" : "Create Habit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
