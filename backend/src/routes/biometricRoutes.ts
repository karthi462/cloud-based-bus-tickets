import { Router } from 'express';
import { BiometricController } from '../controllers/biometricController.js';
import { authenticateJwt } from '../middleware/authMiddleware.js';

const router = Router();

// WebAuthn Passkey Registration (passenger must be logged in)
router.get('/register-options', authenticateJwt, BiometricController.registerOptions);
router.post('/register-verify', authenticateJwt, BiometricController.verifyRegistration);

// WebAuthn Passkey Authentication
router.get('/auth-options', BiometricController.authOptions);
router.post('/auth-verify', BiometricController.verifyAuth);

// Classroom Demonstration Simulation Routes
router.get('/demo-challenge/:passengerId', BiometricController.getDemoChallenge);
router.post('/demo-verify', BiometricController.verifyDemoScan);
router.post('/demo-enrol', authenticateJwt, BiometricController.enrolDemoBiometric);

// 1:N Touch-to-Identify Fingerprint Resolution (Touch finger on sensor -> fetch passenger + Aadhaar info)
router.post('/touch-identify', BiometricController.touchIdentify);
router.get('/enrolled-templates', BiometricController.listEnrolledTemplates);

export default router;
