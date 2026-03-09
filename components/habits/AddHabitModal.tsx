"use client";
import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { HABIT_CATEGORIES, HABIT_THEMES, DEFAULT_THEME } from "@/lib/utils";
import toast from "react-hot-toast";

interface HabitFormData {
  name: string;
  category: string;
  frequency: string;
  color: string; // stores theme key like "olive", "cream", "midnight"
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

const FREQUENCIES = ["Daily", "Weekly", "3x per week", "Weekdays", "Weekends"];

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
    color: DEFAULT_THEME,
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
      setForm({ name: "", category: "General", frequency: "Daily", color: DEFAULT_THEME });
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
          <label className="text-sm font-medium text-[#FAF6F0]">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full bg-[#1A1A1A] border border-[#2D2D2A] rounded-lg px-4 py-2.5 text-sm text-[#FAF6F0] focus:outline-none focus:border-[#6b8c3a] focus:ring-1 focus:ring-[#6b8c3a]"
          >
            {HABIT_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#1A1A1A]">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Frequency */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#FAF6F0]">Frequency</label>
          <div className="flex flex-wrap gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setForm((s) => ({ ...s, frequency: f }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  form.frequency === f
                    ? "bg-[#6b8c3a]/20 border-[#6b8c3a] text-[#8baf48]"
                    : "bg-[#222222] border-[#2D2D2A] text-[#9F9A8C] hover:border-[#3D3D3A]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#FAF6F0]">Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(HABIT_THEMES).map(([key, theme]) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm((f) => ({ ...f, color: key }))}
                className={`relative rounded-xl border-2 p-3 transition-all ${
                  form.color === key
                    ? "border-[#FAF6F0] scale-[1.02]"
                    : "border-[#2D2D2A] hover:border-[#3D3D3A]"
                }`}
                style={{ backgroundColor: theme.bgDone }}
              >
                {/* Color swatch bar */}
                <div className="flex gap-1 mb-2 justify-center">
                  {theme.preview.map((c, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-black/20"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <p className="text-[10px] font-semibold text-center" style={{ color: theme.accent }}>
                  {theme.name}
                </p>
                {/* Selected check */}
                {form.color === key && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#FAF6F0] flex items-center justify-center">
                    <span className="text-[8px] text-[#111]">✓</span>
                  </div>
                )}
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
