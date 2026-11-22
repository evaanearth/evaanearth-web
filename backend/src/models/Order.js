import mongoose from 'mongoose';
const itemSchema = new mongoose.Schema({ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, title: String, image: String, unitPrice: Number, quantity: Number, lineTotal: Number }, { _id: false });
const addressSchema = new mongoose.Schema({ fullName: String, phone: String, addressLine1: String, addressLine2: String, city: String, state: String, postalCode: String, country: String }, { _id: false });
const attemptSchema = new mongoose.Schema({ razorpayOrderId: String, status: { type: String, enum: ['created', 'failed', 'captured'], default: 'created' }, paymentId: String, createdAt: { type: Date, default: Date.now }, failureReason: String }, { _id: false });
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, items: [itemSchema], shippingAddress: addressSchema,
  subtotal: Number, shippingFee: { type: Number, default: 0 }, total: Number, currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['payment_pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'payment_pending', index: true },
  paymentStatus: { type: String, enum: ['pending', 'captured', 'failed', 'refund_required', 'refunded'], default: 'pending' },
  reservationState: { type: String, enum: ['active', 'consumed', 'released'], default: 'active', index: true },
  reservationExpiresAt: { type: Date, required: true, index: true }, razorpayOrderId: String, razorpayPaymentId: String,
  paymentAttempts: [attemptSchema], paidAt: Date, note: String
}, { timestamps: true });
schema.index({ status: 1, reservationState: 1, reservationExpiresAt: 1 });
export const Order = mongoose.model('Order', schema);
