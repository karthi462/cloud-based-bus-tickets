import { Router } from 'express';
import { ConductorController } from '../controllers/conductorController.js';
import { authenticateJwt, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Conductor operational context: drivers, buses, routes, stops
router.get('/context', authenticateJwt, requireRole('CONDUCTOR', 'ADMIN'), ConductorController.getOperationalContext);

// Privacy-preserving passenger biometric lookup
router.get('/lookup-passenger/:passengerId', authenticateJwt, requireRole('CONDUCTOR', 'ADMIN'), ConductorController.lookupPassenger);

export default router;
