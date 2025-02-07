import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import Blog from '@/app/blog/BlogModel';

let isConnected = false; // Track the connection status

async function connectDB() {
  if (isConnected) return;

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function GET() {
  try {
    await connectDB();

    // Add a test document if the collection is empty
    const count = await Blog.countDocuments();
    if (count === 0) {
      const testBlog = new Blog({
        title: "Test Blog Post",
        author: "Test Author",
        readTime: "5 min read",
        description: "This is a test blog post",
        imageUrl: "/test-image.jpg"
      });
      await testBlog.save();
      console.log('Created test blog post');
    }

    const blogs = await Blog.find().sort({ createdAt: -1 });
    console.log('Successfully fetched blogs');

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch blogs', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    
    const testBlog = new Blog({
      title: "Test Blog Post",
      author: "Test Author",
      readTime: "5 min read",
      description: "This is a test blog post",
      imageUrl: "/test-image.jpg"
    });

    await testBlog.save();
    console.log('Test blog saved successfully');

    return NextResponse.json({ message: 'Test blog created successfully' });
  } catch (error) {
    console.error('Error creating test blog:', error);
    return NextResponse.json({
      error: 'Failed to create test blog',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
} 