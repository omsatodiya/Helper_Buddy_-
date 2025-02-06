import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import mongoose from "mongoose";
import { User } from "../[...nextauth]/models/User";
import { ResetToken } from "../[...nextauth]/models/ResetToken";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { email } = await req.json();
    const user = await User.findOne({ email });

    // Generate token even if user doesn't exist (security through obscurity)
    const token = crypto.randomBytes(32).toString("hex");

    // Only store token if user exists
    if (user) {
      // Remove any existing tokens for this email
      await ResetToken.deleteMany({ email });

      // Create new token
      await ResetToken.create({
        email,
        token,
      });

      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Reset Your Password",
        html: `
          <h1>Reset Your Password</h1>
          <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });
    }

    // Always return success (security through obscurity)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
