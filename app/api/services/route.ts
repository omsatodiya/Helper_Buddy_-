import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import ServiceModel from '@/app/ServiceModel';

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    if (mongoose.connection.readyState >= 1) {
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
};

// API Route Handler
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const serviceData = await req.json();
    const service = new ServiceModel(serviceData);
    await service.save();
    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let query = {};
    if (category) {
      query = { category: { $regex: new RegExp(category, "i") } };
    }

    const services = await ServiceModel.find(query);
    return NextResponse.json(services, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
