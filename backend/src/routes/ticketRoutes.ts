import { Router } from 'express';
import { TicketController } from '../controllers/ticketController.js';
import { authenticateJwt, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

// Preview fare (Public / Authenticated)
router.get('/fare-preview', TicketController.calculateFarePreview);

// Generate ticket (Requires CONDUCTOR or ADMIN with GENERATE_TICKETS permission)
router.post(
  '/generate',
  authenticateJwt,
  requirePermission('GENERATE_TICKETS'),
  TicketController.generateTicket
);

// Validate ticket (Requires CONDUCTOR or ADMIN with VALIDATE_TICKETS permission)
router.post(
  '/validate',
  authenticateJwt,
  requirePermission('VALIDATE_TICKETS'),
  TicketController.validateTicket
);

// List tickets (Role-filtered)
router.get('/', authenticateJwt, TicketController.listTickets);

// Get specific ticket by ID
router.get('/:id', authenticateJwt, TicketController.getTicketById);

export default router;
