import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import Blog from '@/app/blog/BlogModel';

// Connect to MongoDB
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

// GET all blogs
export async function GET() {
  try {
    await connectDB();
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// DELETE blog
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const deletedBlog = await Blog.findOneAndDelete({ _id: id });
    
    if (!deletedBlog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}

// POST new blog
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const newBlog = new Blog(body);
    await newBlog.save();
    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}

// PUT (update) blog
export async function PUT(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    // First, get the existing blog
    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Get update data from request body
    const body = await request.json();
    console.log('Received update data:', body);

    // Create update object by merging existing data with new data
    const updateData = {
      title: body.title || existingBlog.title,
      author: body.author || existingBlog.author,
      readTime: body.readTime || existingBlog.readTime,
      description: body.description || existingBlog.description,
      imageUrl: body.imageUrl || existingBlog.imageUrl,
      tags: body.tags || existingBlog.tags,
      updatedAt: new Date()
    };

    console.log('Processed update data:', updateData);

    // Perform update with merged data
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        new: true,
        runValidators: false
      }
    );

    console.log('Update successful:', updatedBlog);
    return NextResponse.json(updatedBlog);

  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update blog',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}