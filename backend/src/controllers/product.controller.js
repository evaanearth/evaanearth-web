import { Product } from '../models/Product.js';
import { ProductView } from '../models/ProductView.js';
import * as products from '../services/product.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cache } from '../config/redis.js';
export const list = asyncHandler(async (req, res) => { const data = await products.listProducts(req.query); res.json({ success: true, data }); });
export const detail = asyncHandler(async (req, res) => {
  const p = await Product.findOne({ slug: req.params.slug, status: 'active' }).populate('category', 'name slug');
  if (!p) throw new ApiError(404, 'Product not found');
  await Product.updateOne({ _id: p._id }, { $inc: { views: 1 } });
  await ProductView.create({ product: p._id, visitor: req.ip, user: req.user?._id }).catch(() => {});
  res.json({ success: true, data: { product: p } });
});
export const create = asyncHandler(async (req, res) => { const product = await products.createProduct(req.body); res.status(201).json({ success: true, data: { product } }); });
export const update = asyncHandler(async (req, res) => { const product = await products.updateProduct(req.params.id, req.body); res.json({ success: true, data: { product } }); });
export const archive = asyncHandler(async (req, res) => { await products.archiveProduct(req.params.id); res.json({ success: true, message: 'Product archived' }); });
export const sellerList = asyncHandler(async (_req, res) => { const items = await Product.find({ status: { $ne: 'archived' } }).populate('category', 'name').sort({ createdAt: -1 }); res.json({ success: true, data: { items } }); });
