import { Router } from 'express';
import {
  checkoutPreview,
  createOrder,
  getOrderById,
  listOrders,
} from '../controllers/orderController.js';
import { validateDeliveryDetails } from '../middleware/checkoutValidator.js';
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/checkout/preview', optionalAuthenticate, checkoutPreview);
router.post('/orders', optionalAuthenticate, validateDeliveryDetails, createOrder);
router.get('/orders/:id', getOrderById);
router.get('/orders', authenticate, listOrders);

export default router;
