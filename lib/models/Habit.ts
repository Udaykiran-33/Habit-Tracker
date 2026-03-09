import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IHabit extends Document {
  userId: string;
  name: string;
  category: string;
  frequency: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabit>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, default: "General" },
    frequency: { type: String, default: "Daily" },
    color: { type: String, default: "#6B8C3A" },
    icon: { type: String, default: "target" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Habit = models.Habit || model<IHabit>("Habit", HabitSchema);
