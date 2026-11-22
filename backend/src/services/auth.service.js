import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, signRefreshToken, hashToken, randomOtp, hashOtp, safeEqual, verifyRefreshToken } from '../utils/tokens.js';
import { env } from '../config/env.js';
import { sendOtpEmail } from './email.service.js';

const publicUser = user => ({ id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified });
export async function issueSession(user) {
  const accessToken = signAccessToken(user); const refreshToken = signRefreshToken(user);
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 86400000);
  await User.updateOne({ _id: user._id }, { $push: { refreshTokens: { hash: hashToken(refreshToken), expiresAt } } });
  return { user: publicUser(user), accessToken, refreshToken };
}
export async function register(data) {
  const exists = await User.exists({ email: data.email }); if (exists) throw new ApiError(409, 'An account with this email already exists');
  const password = await bcrypt.hash(data.password, 12);
  const user = await User.create({ ...data, password, role: 'customer' });
  return issueSession(user);
}
export async function login(data) {
  const user = await User.findOne({ email: data.email }).select('+password');
  if (!user || !(await bcrypt.compare(data.password, user.password))) throw new ApiError(401, 'Incorrect email or password');
  if (!user.isActive) throw new ApiError(403, 'This account is disabled');
  return issueSession(user);
}
export async function rotateRefresh(token) {
  if (!token) throw new ApiError(401, 'Refresh session missing');
  let payload; try { payload = verifyRefreshToken(token); } catch { throw new ApiError(401, 'Refresh session expired'); }
  const hash = hashToken(token);
  const user = await User.findOne({ _id: payload.sub, 'refreshTokens.hash': hash }).select('+refreshTokens');
  if (!user) throw new ApiError(401, 'Refresh session is no longer valid');
  await User.updateOne({ _id: user._id }, { $pull: { refreshTokens: { hash } } });
  return issueSession(user);
}
export async function logout(userId, token) {
  if (token) await User.updateOne({ _id: userId }, { $pull: { refreshTokens: { hash: hashToken(token) } } });
}
export async function beginPasswordReset(email) {
  const user = await User.findOne({ email });
  if (!user) return { message: 'If an account exists, a reset code has been sent.' };
  const otp = randomOtp();
  await User.updateOne({ _id: user._id }, { $set: { resetOtpHash: hashOtp(otp), resetOtpExpiresAt: new Date(Date.now() + 10 * 60_000), resetOtpAttempts: 0 } });
  await sendOtpEmail(user, otp);
  return { message: 'If an account exists, a reset code has been sent.', ...(env.NODE_ENV === 'development' && { devOtp: otp }) };
}
export async function resetPassword({ email, otp, password }) {
  const user = await User.findOne({ email }).select('+resetOtpHash +resetOtpAttempts');
  if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt || user.resetOtpExpiresAt < new Date() || user.resetOtpAttempts >= 5 || !safeEqual(user.resetOtpHash, hashOtp(otp))) {
    if (user) await User.updateOne({ _id: user._id }, { $inc: { resetOtpAttempts: 1 } });
    throw new ApiError(400, 'The reset code is invalid or expired');
  }
  const hashed = await bcrypt.hash(password, 12);
  await User.updateOne({ _id: user._id }, { $set: { password: hashed, refreshTokens: [] }, $unset: { resetOtpHash: 1, resetOtpExpiresAt: 1, resetOtpAttempts: 1 } });
  return { message: 'Password updated. Please sign in again.' };
}
