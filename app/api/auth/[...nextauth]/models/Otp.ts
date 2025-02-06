import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: { type: Date, expires: 600, default: Date.now },
});

export const Otp = mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
