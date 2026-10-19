import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getCategories,
  resetDemoData,
} from '../controllers/productController.js';

const router = Router();

router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/categories', getCategories);
router.post('/demo/reset', resetDemoData);

export default router;
