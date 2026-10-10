import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticateJwt, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Enforce ADMIN role for all routes in this router
router.use(authenticateJwt, requireRole('ADMIN'));

router.get('/analytics', AdminController.getDashboardAnalytics);
router.get('/passengers', AdminController.listPassengers);
router.patch('/passengers/:passengerId/status', AdminController.setPassengerStatus);
router.patch('/passengers/:passengerId/credit-limit', AdminController.updatePassengerCreditLimit);

router.get('/conductors', AdminController.listConductors);
router.post('/conductors', AdminController.createConductor);

router.post('/buses', AdminController.registerBus);
router.post('/drivers', AdminController.registerDriver);

router.get('/fare-rules', AdminController.getFareRules);
router.put('/fare-rules', AdminController.updateFareRules);

router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
