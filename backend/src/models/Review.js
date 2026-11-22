import mongoose from 'mongoose';
const schema = new mongoose.Schema({ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true }, user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, rating: { type: Number, min: 1, max: 5, required: true }, title: { type: String, maxlength: 100 }, comment: { type: String, required: true, maxlength: 1200 }, sellerReply: { type: String, maxlength: 1200 }, sellerRepliedAt: Date }, { timestamps: true });
schema.index({ product: 1, user: 1 }, { unique: true });
export const Review = mongoose.model('Review', schema);
