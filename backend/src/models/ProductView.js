import mongoose from 'mongoose';
const schema = new mongoose.Schema({ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true }, visitor: { type: String, index: true }, user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, viewedAt: { type: Date, default: Date.now } }, { timestamps: false });
schema.index({ viewedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });
export const ProductView = mongoose.model('ProductView', schema);
