import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export async function uploadProductImage(buffer) {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) throw new ApiError(503, 'Cloudinary is not configured. You can also add image URLs in the product form');
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !['image/jpeg', 'image/png', 'image/webp'].includes(detected.mime)) throw new ApiError(415, 'The uploaded file is not a supported image');
  cloudinary.config({ cloud_name: env.CLOUDINARY_CLOUD_NAME, api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET, secure: true });
  const normalized = await sharp(buffer).rotate().resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'evaan-earth/products', resource_type: 'image', format: 'webp' }, (error, result) => {
      if (error) return reject(new ApiError(502, 'Image upload failed'));
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(normalized);
  });
}
