import { Request, Response } from 'express';
import { TicketService } from '../services/ticketService.js';
import { FareService } from '../services/fareService.js';
import { getRepository } from '../repositories/index.js';
import { AuditService } from '../services/auditService.js';
import { Ticket } from '../models/types.js';

export class TicketController {
  /**
   * Preview fare before generating ticket
   */
  static async calculateFarePreview(req: Request, res: Response): Promise<void> {
    try {
      const { routeId, boardingStopId, destinationStopId } = req.query;

      if (!routeId || !boardingStopId || !destinationStopId) {
        res.status(400).json({ success: false, message: 'routeId, boardingStopId, and destinationStopId are required' });
        return;
      }

      const result = await FareService.calculateFare(
        routeId as string,
        boardingStopId as string,
        destinationStopId as string
      );

      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Generate Ticket (Conductor action with passenger biometric verification)
   */
  static async generateTicket(req: Request, res: Response): Promise<void> {
    try {
      const {
        conductorEmployeeId,
        driverId,
        busNumber,
        routeId,
        passengerId,
        boardingStopId,
        destinationStopId,
        authVerified,
        authMethod,
        authProof,
      } = req.body;

      if (
        !conductorEmployeeId ||
        !driverId ||
        !busNumber ||
        !routeId ||
        !passengerId ||
        !boardingStopId ||
        !destinationStopId
      ) {
        res.status(400).json({
          success: false,
          message: 'Missing required ticketing parameters (conductor, driver, bus, route, passenger, stops)',
        });
        return;
      }

      const ticket = await TicketService.generateTicket({
        conductorEmployeeId,
        driverId,
        busNumber,
        routeId,
        passengerId,
        boardingStopId,
        destinationStopId,
        authVerified: !!authVerified,
        authMethod: authMethod || 'SIMULATED_FINGERPRINT',
        authProof,
      });

      // Generate QR code data URL for direct instant rendering
      const qrDataUrl = await TicketService.getQrCodeDataUrl(ticket.qrCodeData);

      await AuditService.log('TICKET_ISSUANCE', 'TICKETS', {
        ticketId: ticket.ticketId,
        passengerId: ticket.passengerId,
        fare: ticket.fare,
        paymentMethod: ticket.paymentMethod,
        conductorEmployeeId: ticket.conductorEmployeeId,
      }, {
        userId: req.user?.id,
        role: req.user?.role,
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Bus ticket generated successfully',
        ticket: {
          ...ticket,
          qrCodeDataUrl: qrDataUrl,
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Get Ticket Details by ID
   */
  static async getTicketById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const repo = getRepository();
      const ticket = await repo.getTicketById(id);

      if (!ticket) {
        res.status(404).json({ success: false, message: 'Ticket not found' });
        return;
      }

      // If requested by a passenger, verify ownership
      if (req.user?.role === 'PASSENGER') {
        const profile = await repo.getPassengerProfileByUserId(req.user.id);
        if (profile?.passengerId !== ticket.passengerId) {
          res.status(403).json({ success: false, message: 'Forbidden: You cannot view another passenger\'s ticket' });
          return;
        }
      }

      const qrDataUrl = await TicketService.getQrCodeDataUrl(ticket.qrCodeData);

      res.json({
        success: true,
        ticket: {
          ...ticket,
          qrCodeDataUrl: qrDataUrl,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Validate Ticket (Conductor / Inspector feature)
   */
  static async validateTicket(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId, conductorEmployeeId } = req.body;
      if (!ticketId) {
        res.status(400).json({ success: false, message: 'ticketId is required' });
        return;
      }

      const result = await TicketService.validateTicket(
        ticketId,
        conductorEmployeeId || 'SYSTEM_VALIDATOR'
      );

      if (!result.valid) {
        res.status(400).json({ success: false, ...result });
        return;
      }

      await AuditService.log('TICKET_VALIDATION', 'TICKETS', {
        ticketId,
        conductorEmployeeId,
        alreadyValidated: result.alreadyValidated,
      }, {
        userId: req.user?.id,
        role: req.user?.role,
        ipAddress: req.ip,
      });

      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * List tickets with role-based filtering
   */
  static async listTickets(req: Request, res: Response): Promise<void> {
    try {
      const repo = getRepository();
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      let tickets: Ticket[] = [];

      if (user.role === 'ADMIN') {
        tickets = await repo.listAllTickets();
      } else if (user.role === 'CONDUCTOR') {
        const conductor = await repo.getConductorProfileByUserId(user.id);
        if (conductor) {
          tickets = await repo.listTicketsByConductorId(conductor.employeeId);
        }
      } else {
        const passenger = await repo.getPassengerProfileByUserId(user.id);
        if (passenger) {
          tickets = await repo.listTicketsByPassengerId(passenger.passengerId);
        }
      }

      res.json({ success: true, tickets });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
