import { Router } from 'express';
import { LocationController } from '../controllers/locationController.js';
import { authenticateJwt } from '../middleware/authMiddleware.js';

const router = Router();

// Conductor: update bus GPS position (requires auth)
router.post('/update', authenticateJwt, LocationController.updateBusLocation);

// Conductor: stop location sharing
router.post('/stop', authenticateJwt, LocationController.stopBusLocation);

// Passenger / Public: get all active bus locations
router.get('/all', LocationController.getAllBusLocations);

// Passenger / Public: get single bus location
router.get('/bus/:busId', LocationController.getBusLocation);

export default router;
