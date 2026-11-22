import { Router } from 'express';
import * as c from '../controllers/review.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../constants/roles.js';
import { validate } from '../middlewares/validate.js';
import { reviewSchema, sellerReplySchema } from '../validations/schemas.js';
const router = Router(); router.get('/product/:productId', c.listForProduct); router.post('/', requireAuth, validate(reviewSchema), c.create); router.get('/seller', requireAuth, requireRole(ROLES.SELLER), c.sellerList); router.post('/:id/reply', requireAuth, requireRole(ROLES.SELLER), validate(sellerReplySchema), c.reply); export default router;
