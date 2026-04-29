// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Configure once
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Uploads a File to Cloudinary and returns the secure URL.
 * Used exclusively in Server Actions to avoid exposing API secrets to the browser.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'saree-store/products', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}