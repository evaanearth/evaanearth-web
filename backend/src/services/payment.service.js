import crypto from 'node:crypto';
import { razorpay } from '../config/razorpay.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { Order } from '../models/Order.js';
import { consumeReservation } from './inventory.service.js';
import { User } from '../models/User.js';
import { sendOrderConfirmation } from './email.service.js';

function requireGateway() { if (!razorpay) throw new ApiError(503, 'Razorpay is not configured. Add your test keys to backend/.env'); }
export async function createPaymentAttempt(orderId, userId) {
  requireGateway();
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.paymentStatus === 'captured') throw new ApiError(409, 'This order is already paid');
  if (order.reservationState !== 'active' || order.reservationExpiresAt <= new Date()) throw new ApiError(410, 'The five-minute stock reservation has expired. Please create a new order');
  const gatewayOrder = await razorpay.orders.create({ amount: Math.round(order.total * 100), currency: 'INR', receipt: `ee-${String(order._id).slice(-18)}`, notes: { orderId: String(order._id), userId: String(userId) } });
  order.razorpayOrderId = gatewayOrder.id;
  order.paymentAttempts.push({ razorpayOrderId: gatewayOrder.id, status: 'created' });
  await order.save();
  return { orderId: order._id, razorpayOrderId: gatewayOrder.id, amount: gatewayOrder.amount, currency: gatewayOrder.currency, keyId: env.RAZORPAY_KEY_ID, expiresAt: order.reservationExpiresAt };
}
export function verifyCheckoutSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const expected = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  const a = Buffer.from(expected); const b = Buffer.from(String(razorpay_signature || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
export function verifyWebhookSignature(rawBody, signature) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = crypto.createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');
  const a = Buffer.from(expected); const b = Buffer.from(String(signature || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
export async function completePayment({ orderId, paymentId }) {
  requireGateway();
  const [payment, orderSnapshot] = await Promise.all([razorpay.payments.fetch(paymentId), Order.findById(orderId)]);
  if (!orderSnapshot) throw new ApiError(404, 'Order not found');
  const validGatewayOrders = [orderSnapshot.razorpayOrderId, ...orderSnapshot.paymentAttempts.map(a => a.razorpayOrderId)].filter(Boolean);
  if (!validGatewayOrders.includes(payment.order_id) || payment.currency !== 'INR' || Number(payment.amount) !== Math.round(orderSnapshot.total * 100)) throw new ApiError(400, 'Payment does not match this order');
  if (payment.status !== 'captured') throw new ApiError(402, 'Payment has not been captured');
  const result = await consumeReservation(orderId, paymentId);
  const order = result.order;
  if (result.shouldRefund) {
    // Do not fulfil against stock that may already have been sold. Refund is explicit and auditable.
    try { if (payment.status === 'captured') await razorpay.payments.refund(paymentId, { amount: payment.amount, notes: { reason: 'Reservation expired before payment confirmation' } }); } catch { /* flagged for manual reconciliation */ }
    throw new ApiError(409, 'Payment was received after the stock reservation ended. The order was not fulfilled; check your payment refund status.');
  }
  await Order.updateOne({ _id: order._id, 'paymentAttempts.razorpayOrderId': payment.order_id }, { $set: { 'paymentAttempts.$.status': 'captured', 'paymentAttempts.$.paymentId': paymentId } });
  const user = await User.findById(order.user);
  if (user) await sendOrderConfirmation(user, order).catch(() => {});
  return order;
}
