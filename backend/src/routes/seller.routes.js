import { Router } from 'express';
import { analytics, orders, updateOrderStatus } from '../controllers/seller.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../constants/roles.js';
const router = Router(); router.use(requireAuth, requireRole(ROLES.SELLER)); router.get('/analytics', analytics); router.get('/orders', orders); router.patch('/orders/:id/status', updateOrderStatus); export default router;
