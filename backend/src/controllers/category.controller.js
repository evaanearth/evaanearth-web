import { Category } from '../models/Category.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';
export const list = asyncHandler(async (_req, res) => { const items = await Category.find({ isActive: true }).sort({ name: 1 }).lean(); res.json({ success: true, data: { items } }); });
export const create = asyncHandler(async (req, res) => { const category = await Category.create({ ...req.body, slug: slugify(req.body.name) }); res.status(201).json({ success: true, data: { category } }); });
