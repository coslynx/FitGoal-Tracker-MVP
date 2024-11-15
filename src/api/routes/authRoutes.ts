import express, { Request, Response } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', authMiddleware, authController.register);
router.post('/login', authController.login);
router.get('/logout', authMiddleware, authController.logout);
router.post('/reset-password', authController.resetPassword);

export default router;

```