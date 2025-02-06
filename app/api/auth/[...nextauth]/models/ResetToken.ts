import mongoose from "mongoose";

const ResetTokenSchema = new mongoose.Schema({
  email: String,
  token: String,
  createdAt: { type: Date, expires: 3600, default: Date.now }, // Expires in 1 hour
});

export const ResetToken =
  mongoose.models.ResetToken || mongoose.model("ResetToken", ResetTokenSchema);
