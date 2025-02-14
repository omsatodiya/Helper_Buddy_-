import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();
    console.log('Received image URL:', imageUrl);

    // Example URL: https://res.cloudinary.com/dylgppwvp/image/upload/v1234567890/Home/blogs/filename.jpg
    const regex = /\/v\d+\/(.+?)\.[^.]+$/;
    const match = imageUrl.match(regex);
    
    if (!match) {
      console.error('URL parsing failed for:', imageUrl);
      throw new Error('Invalid image URL format');
    }

    const public_id = match[1]; // This will get the path without version and extension
    console.log('Extracted public_id:', public_id);

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: 'image',
      invalidate: true
    });
    
    console.log('Cloudinary delete result:', result);

    if (result.result === 'ok') {
      console.log('Successfully deleted image from Cloudinary');
      return Response.json({ success: true });
    } else {
      console.error('Cloudinary returned unexpected result:', result);
      throw new Error('Failed to delete image');
    }
  } catch (error) {
    console.error('Full error details:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to delete image' }, 
      { status: 500 }
    );
  }
} 