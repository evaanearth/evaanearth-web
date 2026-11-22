import mongoose from 'mongoose';
const refreshSchema = new mongoose.Schema({ hash: { type: String, required: true }, expiresAt: { type: Date, required: true } }, { _id: false });
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'seller'], default: 'customer', immutable: true },
  isVerified: { type: Boolean, default: false }, isActive: { type: Boolean, default: true },
  refreshTokens: { type: [refreshSchema], default: [], select: false },
  resetOtpHash: { type: String, select: false }, resetOtpExpiresAt: Date, resetOtpAttempts: { type: Number, default: 0, select: false }
}, { timestamps: true });
userSchema.index({ role: 1 }, { unique: true, partialFilterExpression: { role: 'seller' } });
export const User = mongoose.model('User', userSchema);
