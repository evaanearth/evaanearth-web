import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import pinoHttp from 'pino-http';
import routes from './routes/index.js';
import { webhook as paymentWebhook } from './controllers/payment.controller.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { apiLimiter } from './middlewares/rateLimit.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import { register, httpRequests } from './middlewares/metrics.js';

const app = express();
if (env.TRUST_PROXY === 'true') app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'], fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
    imgSrc: ["'self'", 'data:', 'blob:', 'https:'], connectSrc: ["'self'", 'https:', 'wss:'],
    frameSrc: ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com'], formAction: ["'self'", 'https://api.razorpay.com'], objectSrc: ["'none'"]
  } }
}));
const allowedClientOrigins = env.CLIENT_URL.split(',').map((origin) => origin.trim().replace(/\/+$/, '')).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header (health checks, CLI tools, server-to-server) are allowed.
    if (!origin || allowedClientOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));
app.use(compression());
app.use(pinoHttp({ logger, customLogLevel: (_req, res, error) => error || res.statusCode >= 500 ? 'error' : 'info' }));
// Razorpay signs the exact raw request bytes. Keep this route before express.json().
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), paymentWebhook);
app.use(express.json({ limit: '1mb' })); app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser()); app.use(mongoSanitize()); app.use(hpp());
app.get('/health', (_req, res) => res.json({ success: true, service: 'evaan-earth-api', time: new Date().toISOString() }));
app.get('/api/v1', (_req, res) => res.json({ success: true, service: 'evaan-earth-api', version: 'v1', message: 'Evaan Earth API is running' }));
app.get('/metrics', async (_req, res) => { res.set('Content-Type', register.contentType); res.end(await register.metrics()); });
app.use('/api/v1', apiLimiter, (req, res, next) => { res.on('finish', () => httpRequests.inc({ method: req.method, route: req.route?.path || req.path, status: res.statusCode })); next(); }, routes);
app.use(notFound); app.use(errorHandler);
export default app;
