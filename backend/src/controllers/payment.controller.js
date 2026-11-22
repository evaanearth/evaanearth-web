import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createPaymentAttempt, verifyCheckoutSignature, verifyWebhookSignature, completePayment } from '../services/payment.service.js';
import { logger } from '../config/logger.js';
export const attempt = asyncHandler(async (req, res) => { const data = await createPaymentAttempt(req.params.orderId, req.user._id); res.json({ success: true, data }); });
export const verify = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!verifyCheckoutSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature })) throw new ApiError(400, 'Payment signature verification failed');
  const order = await Order.findOne({ _id: orderId, user: req.user._id, razorpayOrderId: razorpay_order_id }); if (!order) throw new ApiError(404, 'Payment order not found');
  const paid = await completePayment({ orderId, paymentId: razorpay_payment_id }); res.json({ success: true, data: { order: paid } });
});
export async function webhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!verifyWebhookSignature(req.body, signature)) throw new ApiError(400, 'Invalid webhook signature');
    const event = JSON.parse(req.body.toString('utf8'));
    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      const order = await Order.findOne({ $or: [{ razorpayOrderId: payment?.order_id }, { 'paymentAttempts.razorpayOrderId': payment?.order_id }] });
      if (order && payment?.id) await completePayment({ orderId: order._id, paymentId: payment.id });
    }
    if (event.event === 'payment.failed') {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) await Order.updateOne({ $or: [{ razorpayOrderId: payment.order_id }, { 'paymentAttempts.razorpayOrderId': payment.order_id }], paymentStatus: 'pending' }, { $set: { 'paymentAttempts.$[a].status': 'failed', 'paymentAttempts.$[a].failureReason': payment.error_description || 'Payment failed' } }, { arrayFilters: [{ 'a.razorpayOrderId': payment.order_id }] });
    }
    res.json({ received: true });
  } catch (error) { logger.error({ err: error }, 'Razorpay webhook processing failed'); next(error); }
}
