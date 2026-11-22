import mongoose from 'mongoose';
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, fullName: { type: String, required: true }, phone: { type: String, required: true }, addressLine1: { type: String, required: true }, addressLine2: String, city: { type: String, required: true }, state: { type: String, required: true }, postalCode: { type: String, required: true }, country: { type: String, default: 'India' }, isPrimary: { type: Boolean, default: false } }, { timestamps: true });
schema.index({ user: 1, isPrimary: 1 });
export const Address = mongoose.model('Address', schema);
