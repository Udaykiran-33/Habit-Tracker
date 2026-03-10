import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  message: string;
  category: "feature_request" | "improvement" | "bug" | "other";
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    message: { type: String, required: true },
    category: {
      type: String,
      enum: ["feature_request", "improvement", "bug", "other"],
      default: "other",
    },
  },
  { timestamps: true }
);

export const Feedback =
  models.Feedback || model<IFeedback>("Feedback", FeedbackSchema);
