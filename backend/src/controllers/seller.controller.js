import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { ProductView } from '../models/ProductView.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const analytics = asyncHandler(async (_req, res) => {
  const [products, orders, revenue, reviews, views, bestSellers] = await Promise.all([
    Product.countDocuments({ status: { $ne: 'archived' } }), Order.countDocuments({ paymentStatus: 'captured' }),
    Order.aggregate([{ $match: { paymentStatus: 'captured' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Review.countDocuments(), ProductView.countDocuments(),
    Product.find({ status: { $ne: 'archived' } }).sort({ soldCount: -1 }).limit(5).select('title soldCount views stock')
  ]);
  res.json({ success: true, data: { products, paidOrders: orders, revenue: revenue[0]?.total || 0, reviews, views, bestSellers } });
});
export const orders = asyncHandler(async (_req, res) => { const items = await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(100); res.json({ success: true, data: { items } }); });

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const allowed = ['shipped', 'delivered'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Status must be shipped or delivered' });
  const order = await Order.findOneAndUpdate({ _id: req.params.id, paymentStatus: 'captured', status: { $in: ['processing', 'shipped'] } }, { $set: { status: req.body.status } }, { new: true });
  if (!order) return res.status(404).json({ success: false, message: 'Paid order not found or cannot be updated' });
  res.json({ success: true, data: { order } });
});
