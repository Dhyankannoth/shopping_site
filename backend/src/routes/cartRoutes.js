import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  validateCart,
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/cart', authenticate, getCart);
router.post('/cart/items', authenticate, addToCart);
router.patch('/cart/items/:productId', authenticate, updateQuantity);
router.delete('/cart/items/:productId', authenticate, removeFromCart);
router.delete('/cart', authenticate, clearCart);
router.post('/cart/validate', validateCart);

export default router;
