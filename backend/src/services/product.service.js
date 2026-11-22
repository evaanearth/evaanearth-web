import { Product } from '../models/Product.js';
import { cache } from '../config/redis.js';
import { slugify } from '../utils/slugify.js';
import { ApiError } from '../utils/ApiError.js';

export async function listProducts(query) {
  const { q, category, sort = 'newest', cursor } = query;
  const page = Math.min(1000, Math.max(1, Number.parseInt(query.page || '1', 10) || 1));
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit || '12', 10) || 12));
  const key = `products:${JSON.stringify({ q, category, sort, page, limit, cursor })}`;
  const cached = await cache.get(key); if (cached) return cached;
  const filter = { status: 'active' };
  if (category) filter.category = category;
  if (q) filter.$or = [{ title: new RegExp(escapeRegex(q), 'i') }, { description: new RegExp(escapeRegex(q), 'i') }, { tags: new RegExp(escapeRegex(q), 'i') }];
  if (cursor) filter._id = { $lt: cursor };
  const sortMap = { newest: { createdAt: -1, _id: -1 }, price_asc: { price: 1, _id: -1 }, price_desc: { price: -1, _id: -1 }, rating: { rating: -1, _id: -1 } };
  const selectedSort = cursor ? { _id: -1 } : (sortMap[sort] || sortMap.newest);
  let finder = Product.find(filter).populate('category', 'name slug').sort(selectedSort).limit(limit + 1);
  if (!cursor) finder = finder.skip((page - 1) * limit);
  const items = await finder.lean();
  const hasMore = items.length > limit; if (hasMore) items.pop();
  const result = { items, page, limit, hasMore, nextCursor: hasMore ? String(items.at(-1)?._id || '') : null };
  await cache.set(key, result, 25); return result;
}
function escapeRegex(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
export async function createProduct(data) {
  const base = slugify(data.title); let slug = base; let n = 1;
  while (await Product.exists({ slug })) slug = `${base}-${++n}`;
  const product = await Product.create({ ...data, slug }); await cache.delByPrefix('products:'); return product;
}
export async function updateProduct(id, data) {
  const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, 'Product not found');
  if (data.title) { const base = slugify(data.title); if (base !== product.slug) product.slug = `${base}-${String(product._id).slice(-5)}`; await product.save(); }
  await cache.delByPrefix('products:'); return product;
}
export async function archiveProduct(id) {
  const product = await Product.findByIdAndUpdate(id, { status: 'archived' }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found'); await cache.delByPrefix('products:'); return product;
}
