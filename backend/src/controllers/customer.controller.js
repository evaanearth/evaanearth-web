import { Cart } from '../models/Cart.js';
import { Wishlist } from '../models/Wishlist.js';
import { Address } from '../models/Address.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCart = asyncHandler(async (req, res) => { const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'title slug price stock images status'); res.json({ success: true, data: { cart: cart || { items: [] } } }); });
export const addCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body; const amount = Number(quantity);
  if (!Number.isInteger(amount) || amount < 1 || amount > 20) throw new ApiError(400, 'Quantity must be between 1 and 20');
  const p = await Product.findOne({ _id: productId, status: 'active' });
  if (!p) throw new ApiError(404, 'Product unavailable');
  const currentCart = await Cart.findOne({ user: req.user._id }).lean(); const existingQty = currentCart?.items?.find(i => String(i.product) === String(productId))?.quantity || 0;
  if (p.stock < existingQty + amount) throw new ApiError(409, `Only ${p.stock} left in stock`);
  const cart = await Cart.findOneAndUpdate({ user: req.user._id, 'items.product': productId }, { $inc: { 'items.$.quantity': amount } }, { new: true });
  const result = cart || await Cart.findOneAndUpdate({ user: req.user._id }, { $push: { items: { product: productId, quantity: amount } } }, { new: true, upsert: true, setDefaultsOnInsert: true });
  res.json({ success: true, data: { cart: await result.populate('items.product', 'title slug price stock images status') } });
});
export const updateCartItem = asyncHandler(async (req, res) => {
  const quantity = Number(req.body.quantity); if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new ApiError(400, 'Quantity must be between 1 and 20'); const p = await Product.findOne({ _id: req.params.productId, status: 'active' });
  if (!p || p.stock < quantity) throw new ApiError(409, p ? `Only ${p.stock} left in stock` : 'Product unavailable');
  const cart = await Cart.findOneAndUpdate({ user: req.user._id, 'items.product': req.params.productId }, { $set: { 'items.$.quantity': quantity } }, { new: true }).populate('items.product', 'title slug price stock images status');
  res.json({ success: true, data: { cart: cart || { items: [] } } });
});
export const removeCartItem = asyncHandler(async (req, res) => { const cart = await Cart.findOneAndUpdate({ user: req.user._id }, { $pull: { items: { product: req.params.productId } } }, { new: true }).populate('items.product', 'title slug price stock images status'); res.json({ success: true, data: { cart: cart || { items: [] } } }); });
export const getWishlist = asyncHandler(async (req, res) => { const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'title slug price stock images rating numReviews status'); res.json({ success: true, data: { wishlist: wishlist || { products: [] } } }); });
export const toggleWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.productId, status: 'active' }); if (!product) throw new ApiError(404, 'Product unavailable');
  let w = await Wishlist.findOne({ user: req.user._id }); if (!w) w = await Wishlist.create({ user: req.user._id, products: [] });
  const exists = w.products.some(id => String(id) === String(product._id));
  if (exists) w.products.pull(product._id); else w.products.addToSet(product._id); await w.save();
  await w.populate('products', 'title slug price stock images rating numReviews status'); res.json({ success: true, data: { wishlist: w, added: !exists } });
});
export const listAddresses = asyncHandler(async (req, res) => { const items = await Address.find({ user: req.user._id }).sort({ isPrimary: -1, createdAt: -1 }); res.json({ success: true, data: { items } }); });
export const addAddress = asyncHandler(async (req, res) => { const count = await Address.countDocuments({ user: req.user._id }); const address = await Address.create({ ...req.body, user: req.user._id, isPrimary: count === 0 }); res.status(201).json({ success: true, data: { address } }); });
export const updateAddress = asyncHandler(async (req, res) => { const allowed = ['fullName','phone','addressLine1','addressLine2','city','state','postalCode','country']; const patch = Object.fromEntries(allowed.filter(key => req.body[key] !== undefined).map(key => [key, req.body[key]])); const address = await Address.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { $set: patch }, { new: true, runValidators: true }); if (!address) throw new ApiError(404, 'Address not found'); res.json({ success: true, data: { address } }); });
export const deleteAddress = asyncHandler(async (req, res) => { const a = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id }); if (!a) throw new ApiError(404, 'Address not found'); if (a.isPrimary) { const next = await Address.findOne({ user: req.user._id }).sort({ createdAt: 1 }); if (next) { next.isPrimary = true; await next.save(); } } res.json({ success: true, message: 'Address removed' }); });
export const setPrimaryAddress = asyncHandler(async (req, res) => { const a = await Address.findOne({ _id: req.params.id, user: req.user._id }); if (!a) throw new ApiError(404, 'Address not found'); await Address.updateMany({ user: req.user._id }, { $set: { isPrimary: false } }); a.isPrimary = true; await a.save(); res.json({ success: true, data: { address: a } }); });
export const reserveOrder = asyncHandler(async (req, res) => { const { reserveInventory } = await import('../services/inventory.service.js'); const order = await reserveInventory({ userId: req.user._id, addressId: req.body.addressId, items: req.body.items }); res.status(201).json({ success: true, data: { order } }); });
export const myOrders = asyncHandler(async (req, res) => { const items = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50); res.json({ success: true, data: { items } }); });
export const getOrder = asyncHandler(async (req, res) => { const order = await Order.findOne({ _id: req.params.id, user: req.user._id }); if (!order) throw new ApiError(404, 'Order not found'); res.json({ success: true, data: { order } }); });
