import { Router } from 'express';
import { productImage, productImages } from '../controllers/upload.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../constants/roles.js';
import { upload } from '../middlewares/upload.js';
const router = Router(); router.post('/product-image', requireAuth, requireRole(ROLES.SELLER), upload.single('image'), productImage); router.post('/product-images', requireAuth, requireRole(ROLES.SELLER), upload.array('images', 5), productImages); export default router;
