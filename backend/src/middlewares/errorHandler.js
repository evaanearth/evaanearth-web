import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

export function notFound(req, res, next) { next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`)); }
export function errorHandler(error, req, res, _next) {
  let status = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  if (error.name === 'ValidationError') { status = 400; message = 'Validation failed'; }
  if (error.name === 'CastError') { status = 400; message = 'Invalid resource identifier'; }
  if (error.code === 11000) { status = 409; message = 'A record with this value already exists'; }
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') { status = 401; message = 'Invalid or expired token'; }
  if (status >= 500) logger.error({ err: error, path: req.originalUrl }, 'Request failed');
  res.status(status).json({ success: false, message, ...(error.details && { details: error.details }), ...(env.NODE_ENV !== 'production' && status >= 500 && { stack: error.stack }) });
}
