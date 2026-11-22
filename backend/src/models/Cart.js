import mongoose from 'mongoose';
const itemSchema = new mongoose.Schema({ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, quantity: { type: Number, min: 1, max: 20, default: 1 } }, { _id: false });
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, items: [itemSchema] }, { timestamps: true });
export const Cart = mongoose.model('Cart', schema);
