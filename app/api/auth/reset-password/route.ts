import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { User } from "../[...nextauth]/models/User";
import { ResetToken } from "../[...nextauth]/models/ResetToken";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { token, password } = await req.json();

    // Find token in database
    const resetToken = await ResetToken.findOne({ token });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findOneAndUpdate(
      { email: resetToken.email },
      { $set: { password: hashedPassword } }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove used token
    await ResetToken.deleteOne({ token });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
