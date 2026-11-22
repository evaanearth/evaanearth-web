import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const listForProduct = asyncHandler(async (req, res) => { const items = await Review.find({ product: req.params.productId }).populate('user', 'name').sort({ createdAt: -1 }); res.json({ success: true, data: { items } }); });
export const create = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;
  const purchased = await Order.exists({ user: req.user._id, status: { $in: ['processing', 'shipped', 'delivered'] }, 'items.product': productId });
  if (!purchased) throw new ApiError(403, 'Only customers who purchased this product can review it');
  const review = await Review.create({ product: productId, user: req.user._id, rating, title, comment });
  const stats = await Review.aggregate([{ $match: { product: review.product } }, { $group: { _id: null, rating: { $avg: '$rating' }, count: { $sum: 1 } } }]);
  await Product.updateOne({ _id: productId }, { $set: { rating: stats[0]?.rating || 0, numReviews: stats[0]?.count || 0 } });
  res.status(201).json({ success: true, data: { review } });
});
export const sellerList = asyncHandler(async (_req, res) => { const items = await Review.find().populate('product', 'title slug').populate('user', 'name email').sort({ createdAt: -1 }).limit(100); res.json({ success: true, data: { items } }); });
export const reply = asyncHandler(async (req, res) => { const review = await Review.findByIdAndUpdate(req.params.id, { $set: { sellerReply: req.body.reply, sellerRepliedAt: new Date() } }, { new: true }); if (!review) throw new ApiError(404, 'Review not found'); res.json({ success: true, data: { review } }); });
