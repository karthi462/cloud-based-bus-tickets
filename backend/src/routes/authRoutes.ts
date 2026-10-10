import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateJwt } from '../middleware/authMiddleware.js';
import { rateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// Rate limited login and registration endpoints
router.post('/register', rateLimiter(20, 60), AuthController.registerPassenger);
router.post('/login/passenger', rateLimiter(20, 60), AuthController.loginPassenger);
router.post('/login/conductor', rateLimiter(20, 60), AuthController.loginConductor);
router.post('/login/admin', rateLimiter(20, 60), AuthController.loginAdmin);
router.get('/me', authenticateJwt, AuthController.getMe);

export default router;
