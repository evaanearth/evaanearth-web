import { Router } from 'express';
import auth from './auth.routes.js'; import products from './product.routes.js'; import categories from './category.routes.js';
import customer from './customer.routes.js'; import payments from './payment.routes.js'; import reviews from './review.routes.js';
import seller from './seller.routes.js'; import uploads from './upload.routes.js';
const router = Router();
router.use('/auth', auth); router.use('/products', products); router.use('/categories', categories); router.use('/', customer);
router.use('/payments', payments); router.use('/reviews', reviews); router.use('/seller', seller); router.use('/uploads', uploads);
export default router;
