import mongoose from 'mongoose';
const imageSchema = new mongoose.Schema({ url: { type: String, required: true }, publicId: String, alt: String }, { _id: false });
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 }, slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true, maxlength: 5000 }, category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  images: { type: [imageSchema], validate: v => v.length > 0 }, price: { type: Number, required: true, min: 1 }, compareAtPrice: { type: Number, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 }, sku: { type: String, trim: true, sparse: true, unique: true },
  tags: [{ type: String, trim: true, lowercase: true }], status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active', index: true },
  rating: { type: Number, min: 0, max: 5, default: 0 }, numReviews: { type: Number, default: 0 }, views: { type: Number, default: 0 }, soldCount: { type: Number, default: 0 }
}, { timestamps: true });
schema.index({ title: 'text', description: 'text', tags: 'text' });
schema.index({ category: 1, status: 1, createdAt: -1 });
export const Product = mongoose.model('Product', schema);
