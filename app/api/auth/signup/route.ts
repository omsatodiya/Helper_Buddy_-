import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { User } from "../[...nextauth]/models/User";

export async function POST(req: NextRequest) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const {
      email,
      password,
      firstName,
      lastName,
      address,
      city,
      state,
      mobile,
      gender,
    } = await req.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      name: `${firstName} ${lastName}`,
      email,
      password,
      firstName,
      lastName,
      address,
      city,
      state,
      mobile,
      gender,
      emailVerified: true,
    });

    await user.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
