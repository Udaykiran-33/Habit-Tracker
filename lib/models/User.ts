import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  xp: number;
  level: number;
  coins: number;
  claimedAchievements: string[];
  claimedStreakMilestones: string[];
  claimedCompletionMilestones: number[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    coins: { type: Number, default: 3 },
    claimedAchievements: { type: [String], default: [] },
    claimedStreakMilestones: { type: [String], default: [] },
    claimedCompletionMilestones: { type: [Number], default: [] },
  },
  { timestamps: true }
);

// Delete stale cached model so schema changes always take effect.
// (Mongoose's `models.X || model(...)` pattern reuses old schemas in hot-reload dev environments)
delete mongoose.models["User"];
export const User = model<IUser>("User", UserSchema);
