import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Please sign in to continue');
  let payload;
  try { payload = verifyAccessToken(token); } catch { throw new ApiError(401, 'Session expired. Please sign in again'); }
  const user = await User.findById(payload.sub).select('-password -refreshTokens -resetOtpHash');
  if (!user || !user.isActive) throw new ApiError(401, 'Account unavailable');
  req.user = user; next();
});

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new ApiError(403, 'You do not have permission to perform this action'));
  next();
};
