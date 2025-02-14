import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();
    const regex = /\/v\d+\/(.+?)\.[^.]+$/;
    const match = imageUrl.match(regex);
    
    if (!match) {
      throw new Error('Invalid image URL format');
    }

    const public_id = match[1];

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: 'image',
      invalidate: true
    });

    if (result.result === 'ok') {
      return Response.json({ success: true });
    } else {
      throw new Error('Failed to delete image');
    }
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to delete image' }, 
      { status: 500 }
    );
  }
} 