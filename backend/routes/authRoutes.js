import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { authenticateToken } from '../src/config/auth.js';

const router = express.Router();

router.post('/api/auth/register', AuthController.register);
router.post('/api/auth/login', AuthController.login);
router.get('/api/auth/me', authenticateToken, AuthController.getMe);

export default router;