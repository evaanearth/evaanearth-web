import { Router } from 'express';
import * as c from '../controllers/category.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../constants/roles.js';
const router = Router(); router.get('/', c.list); router.post('/', requireAuth, requireRole(ROLES.SELLER), c.create); export default router;
