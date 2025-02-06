import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Resend } from "resend";
import { Otp } from "@/app/api/auth/[...nextauth]/models/Otp";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { email } = await req.json();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.findOneAndUpdate(
      { email },
      { email, otp },
      { upsert: true, new: true }
    );

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verification Code",
      text: `Your verification code is: ${otp}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { email, otp } = await req.json();
    const stored = await Otp.findOne({ email });

    if (!stored || stored.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    await Otp.deleteOne({ email });
    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "PUT, POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
