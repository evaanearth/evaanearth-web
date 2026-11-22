import { Router } from 'express';
import * as c from '../controllers/payment.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { paymentLimiter } from '../middlewares/rateLimit.js';
const router = Router(); router.post('/webhook', c.webhook); router.post('/:orderId/attempt', requireAuth, paymentLimiter, c.attempt); router.post('/verify', requireAuth, paymentLimiter, c.verify); export default router;
