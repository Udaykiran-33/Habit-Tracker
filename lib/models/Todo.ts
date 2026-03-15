import mongoose, { Schema, models, model, Document } from "mongoose";

export interface ITodo extends Document {
  userId: string;
  task: string;
  time?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new Schema<ITodo>(
  {
    userId: { type: String, required: true, index: true },
    task: { type: String, required: true },
    time: { type: String },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Todo = models.Todo || model<ITodo>("Todo", TodoSchema);
