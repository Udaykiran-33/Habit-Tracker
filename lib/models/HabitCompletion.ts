import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IHabitCompletion extends Document {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: Date;
}

const HabitCompletionSchema = new Schema<IHabitCompletion>(
  {
    habitId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    completed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound unique index: one completion per habit per day
HabitCompletionSchema.index({ habitId: 1, date: 1 }, { unique: true });

export const HabitCompletion =
  models.HabitCompletion ||
  model<IHabitCompletion>("HabitCompletion", HabitCompletionSchema);
