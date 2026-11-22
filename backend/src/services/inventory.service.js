import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Address } from '../models/Address.js';
import { ApiError } from '../utils/ApiError.js';

const RESERVATION_MS = 5 * 60 * 1000;

async function releaseExpiredReservationsForProducts(productIds) {
  // The scheduled worker handles general cleanup. This targeted sweep also runs on checkout,
  // so an expired hold cannot keep a requested product unavailable after a sleeping instance wakes.
  const now = new Date();
  while (true) {
    const expired = await Order.find({
      status: 'payment_pending',
      reservationState: 'active',
      reservationExpiresAt: { $lte: now },
      'items.product': { $in: productIds }
    }).select('_id').sort({ reservationExpiresAt: 1 }).limit(200).lean();
    if (!expired.length) break;
    for (const order of expired) {
      await releaseReservation(order._id, 'Five-minute payment reservation expired');
    }
    if (expired.length < 200) break;
  }
}
export async function reserveInventory({ userId, addressId, items }) {
  const address = await Address.findOne({ _id: addressId, user: userId }).lean();
  if (!address) throw new ApiError(400, 'Choose a valid delivery address');
  const normalized = [...items.reduce((map, item) => { const current = map.get(item.productId); map.set(item.productId, { productId: item.productId, quantity: (current?.quantity || 0) + item.quantity }); return map; }, new Map()).values()];
  await releaseExpiredReservationsForProducts(normalized.map((item) => item.productId));
  const session = await mongoose.startSession(); let created;
  try {
    await session.withTransaction(async () => {
      const lines = []; let subtotal = 0;
      for (const item of normalized) {
        const product = await Product.findOneAndUpdate(
          { _id: item.productId, status: 'active', stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }, { new: true, session }
        ).populate('category', 'name');
        if (!product) {
          const exists = await Product.findById(item.productId).session(session).lean();
          throw new ApiError(409, exists?.status === 'active' ? `Only ${exists.stock} left for ${exists.title}` : 'A selected product is unavailable');
        }
        const lineTotal = product.price * item.quantity; subtotal += lineTotal;
        lines.push({ product: product._id, title: product.title, image: product.images?.[0]?.url, unitPrice: product.price, quantity: item.quantity, lineTotal });
      }
      const shippingFee = subtotal >= 999 ? 0 : 60;
      const [order] = await Order.create([{
        user: userId, items: lines, shippingAddress: {
          fullName: address.fullName, phone: address.phone, addressLine1: address.addressLine1, addressLine2: address.addressLine2,
          city: address.city, state: address.state, postalCode: address.postalCode, country: address.country
        }, subtotal, shippingFee, total: subtotal + shippingFee, reservationExpiresAt: new Date(Date.now() + RESERVATION_MS)
      }], { session });
      created = order;
    }, { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } });
  } finally { await session.endSession(); }
  return created;
}

export async function releaseReservation(orderId, reason = 'Reservation expired') {
  const session = await mongoose.startSession(); let released = false;
  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: orderId, status: 'payment_pending', reservationState: 'active', reservationExpiresAt: { $lte: new Date() }
      }).session(session);
      if (!order) return;
      order.reservationState = 'released';
      order.status = 'cancelled';
      // Preserve the captured-late-payment audit state while still restoring inventory.
      if (order.paymentStatus !== 'refund_required') order.paymentStatus = 'failed';
      order.note = reason;
      await order.save({ session });
      for (const item of order.items) await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }, { session });
      released = true;
    }, { writeConcern: { w: 'majority' } });
  } finally { await session.endSession(); }
  return released;
}

export async function consumeReservation(orderId, paymentId) {
  const session = await mongoose.startSession(); let orderResult; let shouldRefund = false;
  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new ApiError(404, 'Order not found');
      if (order.paymentStatus === 'captured') { shouldRefund = order.razorpayPaymentId !== paymentId; orderResult = order; return; }
      if (order.reservationState !== 'active' || order.reservationExpiresAt <= new Date()) {
        order.paymentStatus = 'refund_required'; order.razorpayPaymentId = paymentId; order.note = 'Payment captured after inventory reservation ended; refund required';
        await order.save({ session }); shouldRefund = true; orderResult = order; return;
      }
      order.status = 'processing'; order.paymentStatus = 'captured'; order.reservationState = 'consumed'; order.razorpayPaymentId = paymentId; order.paidAt = new Date();
      await order.save({ session });
      for (const item of order.items) await Product.updateOne({ _id: item.product }, { $inc: { soldCount: item.quantity } }, { session });
      orderResult = order;
    }, { writeConcern: { w: 'majority' } });
  } finally { await session.endSession(); }
  return { order: orderResult, shouldRefund };
}
