import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';
const standard = { standardHeaders: 'draft-7', legacyHeaders: false, handler: (_req, _res, next) => next(new ApiError(429, 'Too many requests. Please try again shortly.')) };
export const apiLimiter = rateLimit({ ...standard, windowMs: 60_000, limit: 180 });
export const authLimiter = rateLimit({ ...standard, windowMs: 15 * 60_000, limit: 12 });
export const paymentLimiter = rateLimit({ ...standard, windowMs: 60_000, limit: 15 });
