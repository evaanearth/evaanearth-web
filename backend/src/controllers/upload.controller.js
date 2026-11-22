import { uploadProductImage } from '../services/upload.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const productImage = asyncHandler(async (req, res) => { const image = await uploadProductImage(req.file.buffer); res.status(201).json({ success: true, data: { image } }); });
export const productImages = asyncHandler(async (req, res) => { const images = await Promise.all((req.files || []).map(file => uploadProductImage(file.buffer))); res.status(201).json({ success: true, data: { images } }); });
