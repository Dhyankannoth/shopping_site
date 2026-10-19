import { Router } from 'express';
import { register, login, googleAuth, getCurrentUser } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/authValidator.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/google', googleAuth);
router.get('/me', authenticate, getCurrentUser);

export default router;
