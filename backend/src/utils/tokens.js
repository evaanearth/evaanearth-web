import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAccessToken = (user) => jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL });
export const signRefreshToken = (user) => jwt.sign({ sub: user._id.toString(), type: 'refresh' }, env.JWT_REFRESH_SECRET, { expiresIn: `${env.REFRESH_TOKEN_DAYS}d` });
export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
export const randomOtp = () => String(crypto.randomInt(100000, 1000000));
export const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');
export const safeEqual = (a, b) => {
  const aa = Buffer.from(String(a)); const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
};
