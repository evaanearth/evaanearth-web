import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 6 * 1024 * 1024, files: 5 }, fileFilter: (_req, file, cb) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return cb(new ApiError(415, 'Only JPG, PNG and WebP images are accepted'));
  cb(null, true);
} });
