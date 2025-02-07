import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  emailVerified: Date,
  image: String,
  phone: String,
  address: String,
  bio: String,
  profession: String,
  socialLinks: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String,
  }
});

// Get or create the model
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email })
      .select('-password')
      .lean();
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Error fetching user data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const data = await request.json();
    
    await connectDB();

    // Update user data
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          name: data.name,
          phone: data.phone,
          address: data.address,
          bio: data.bio,
          profession: data.profession,
          socialLinks: {
            facebook: data.socialLinks?.facebook,
            twitter: data.socialLinks?.twitter,
            linkedin: data.socialLinks?.linkedin,
            instagram: data.socialLinks?.instagram,
          }
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error updating user data" },
      { status: 500 }
    );
  }
}
