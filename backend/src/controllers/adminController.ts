import { Request, Response } from 'express';
import { getRepository } from '../repositories/index.js';
import { hashPassword, generateId } from '../utils/crypto.js';
import { AuditService } from '../services/auditService.js';
import { CreditService } from '../services/creditService.js';

export class AdminController {
  /**
   * System Statistics and Real-Time Transport Analytics
   */
  static async getDashboardAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const repo = getRepository();

      const [
        passengers,
        conductors,
        buses,
        tickets,
        transactions,
        creditAccounts,
        withdrawals,
        auditLogs,
      ] = await Promise.all([
        repo.listPassengerProfiles(),
        repo.listConductorProfiles(),
        repo.listBuses(),
        repo.listAllTickets(),
        repo.listAllTransactions(),
        repo.listAllCreditAccounts(),
        repo.listWithdrawalRequests(),
        repo.listAuditLogs(200),
      ]);

      // Calculate today's date in YYYY-MM-DD
      const todayPrefix = new Date().toISOString().split('T')[0];
      const todayTickets = tickets.filter((t) => t.issuedAt.startsWith(todayPrefix));

      // Ticket revenue (only genuine ticket fares!)
      const totalTicketRevenue = tickets.reduce((sum, t) => sum + t.fare, 0);
      const todayTicketRevenue = todayTickets.reduce((sum, t) => sum + t.fare, 0);

      // Wallet top-ups (kept strictly separate from ticket revenue)
      const totalWalletTopUps = transactions
        .filter((tx) => tx.type === 'ADD_MONEY' && tx.status === 'SUCCESS')
        .reduce((sum, tx) => sum + tx.amount, 0);

      // Total outstanding travel credit
      const totalOutstandingCredit = creditAccounts.reduce(
        (sum, c) => sum + (c.outstandingCredit || 0),
        0
      );

      // Pending withdrawals
      const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'PENDING').length;

      // Failed auth attempts from audit log
      const failedAuthAttempts = auditLogs.filter(
        (l) => l.action.includes('AUTH_FAILURE') || l.status === 'FAILURE'
      ).length;

      res.json({
        success: true,
        metrics: {
          totalRegisteredPassengers: passengers.length,
          activeConductors: conductors.filter((c) => c.status === 'ACTIVE').length,
          activeBuses: buses.filter((b) => b.status === 'ACTIVE').length,
          ticketsGeneratedToday: todayTickets.length,
          totalTicketsGenerated: tickets.length,
          totalTicketRevenue,
          todayTicketRevenue,
          totalWalletTopUps,
          totalOutstandingCredit,
          pendingWithdrawalsCount,
          failedAuthAttempts,
        },
        recentTicketingActivity: tickets.slice(0, 10),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * List all registered passengers with their wallet and credit status
   */
  static async listPassengers(req: Request, res: Response): Promise<void> {
    try {
      const repo = getRepository();
      const profiles = await repo.listPassengerProfiles();
      const users = await repo.listUsers();

      const combined = await Promise.all(
        profiles.map(async (p) => {
          const user = users.find((u) => u.id === p.userId);
          const wallet = await repo.getWalletByPassengerId(p.passengerId);
          const credit = await repo.getCreditAccountByPassengerId(p.passengerId);
          return {
            ...p,
            status: user?.status || 'ACTIVE',
            walletBalance: wallet?.balance || 0,
            outstandingCredit: credit?.outstandingCredit || 0,
            availableCredit: credit?.availableCredit || 0,
            creditLimit: credit?.maxCreditLimit || 200,
          };
        })
      );

      res.json({ success: true, passengers: combined });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Suspend or Activate Passenger Account
   */
  static async setPassengerStatus(req: Request, res: Response): Promise<void> {
    try {
      const passengerId = req.params.passengerId as string;
      const { status } = req.body;

      if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid status. Must be ACTIVE or SUSPENDED' });
        return;
      }

      const repo = getRepository();
      const profile = await repo.getPassengerProfileByPassengerId(passengerId);
      if (!profile) {
        res.status(404).json({ success: false, message: 'Passenger not found' });
        return;
      }

      await repo.updateUser(profile.userId, { status });

      await AuditService.log('PASSENGER_STATUS_CHANGE', 'USERS', { passengerId, status }, {
        userId: req.user?.id,
        role: req.user?.role,
        ipAddress: req.ip,
      });

      res.json({ success: true, message: `Passenger account status updated to ${status}` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Update Passenger Credit Limit
   */
  static async updatePassengerCreditLimit(req: Request, res: Response): Promise<void> {
    try {
      const passengerId = req.params.passengerId as string;
      const { newLimit } = req.body;

      const parsedLimit = parseFloat(newLimit);
      if (isNaN(parsedLimit) || parsedLimit < 0) {
        res.status(400).json({ success: false, message: 'Valid positive limit is required' });
        return;
      }

      const updated = await CreditService.updateCreditLimit(passengerId, parsedLimit);

      await AuditService.log('CREDIT_LIMIT_UPDATED', 'CREDIT_ACCOUNTS', { passengerId, newLimit: parsedLimit }, {
        userId: req.user?.id,
        role: req.user?.role,
        ipAddress: req.ip,
      });

      res.json({ success: true, message: `Credit limit updated to ₹${parsedLimit}`, creditAccount: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Create Conductor Employee
   */
  static async createConductor(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, email, mobileNumber, password, assignedBusId, assignedRouteId } = req.body;

      if (!fullName || !email || !password || !mobileNumber) {
        res.status(400).json({ success: false, message: 'Full name, email, password, and mobile number are required' });
        return;
      }

      const repo = getRepository();
      const existing = await repo.getUserByEmail(email);
      if (existing) {
        res.status(409).json({ success: false, message: 'Email is already in use' });
        return;
      }

      const userId = generateId('USR-COND');
      const employeeId = `CB-EMP-${Math.floor(2000 + Math.random() * 8000)}`;
      const passwordHash = await hashPassword(password);
      const now = new Date().toISOString();

      await repo.createUser({
        id: userId,
        email,
        passwordHash,
        role: 'CONDUCTOR',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      });

      const profile = await repo.createConductorProfile({
        userId,
        employeeId,
        fullName,
        mobileNumber,
        assignedBusId,
        assignedRouteId,
        status: 'ACTIVE',
        createdAt: now,
      });

      await AuditService.log('CONDUCTOR_CREATED', 'CONDUCTORS', { employeeId, userId }, {
        userId: req.user?.id,
        role: req.user?.role,
        ipAddress: req.ip,
      });

      res.status(201).json({ success: true, message: 'Conductor employee created', conductor: profile });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * List Conductors
   */
  static async listConductors(req: Request, res: Response): Promise<void> {
    try {
      const repo = getRepository();
      const conductors = await repo.listConductorProfiles();
      res.json({ success: true, conductors });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Register Bus
   */
  static async registerBus(req: Request, res: Response): Promise<void> {
    try {
      const { busNumber, capacity, registrationNumber, defaultRouteId } = req.body;
      if (!busNumber || !capacity) {
        res.status(400).json({ success: false, message: 'Bus number and passenger capacity are required' });
        return;
      }

      const repo = getRepository();
      const busId = generateId('BUS');
      const bus = await repo.createBus({
        busId,
        busNumber,
        capacity: parseInt(capacity, 10),
        registrationNumber: registrationNumber || busNumber,
        status: 'ACTIVE',
        defaultRouteId,
        createdAt: new Date().toISOString(),
      });

      await AuditService.log('BUS_REGISTERED', 'BUSES', { busId, busNumber }, {
        userId: req.user?.id,
        role: req.user?.role,
        ipAddress: req.ip,
      });

      res.status(201).json({ success: true, message: 'Bus registered successfully', bus });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Register Driver
   */
  static async registerDriver(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, licenseNumber, phone } = req.body;
      if (!fullName || !licenseNumber || !phone) {
        res.status(400).json({ success: false, message: 'Driver full name, license number, and phone are required' });
        return;
      }

      const repo = getRepository();
      const driverId = generateId('DRV');
      const driver = await repo.createDriver({
        driverId,
        fullName,
        licenseNumber,
        phone,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      });

      await AuditService.log('DRIVER_REGISTERED', 'DRIVERS', { driverId, fullName }, {
        userId: req.user?.id,
        role: req.user?.role,
        ipAddress: req.ip,
      });

      res.status(201).json({ success: true, message: 'Driver registered successfully', driver });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Get & Update Fare Rules
   */
  static async getFareRules(req: Request, res: Response): Promise<void> {
    try {
      const repo = getRepository();
      const rules = await repo.getFareRules();
      res.json({ success: true, fareRules: rules });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateFareRules(req: Request, res: Response): Promise<void> {
    try {
      const repo = getRepository();
      const { baseFare, perKmRate, minimumFare, maximumFare } = req.body;

      const updated = await repo.updateFareRules({
        baseFare: baseFare !== undefined ? parseFloat(baseFare) : undefined,
        perKmRate: perKmRate !== undefined ? parseFloat(perKmRate) : undefined,
        minimumFare: minimumFare !== undefined ? parseFloat(minimumFare) : undefined,
        maximumFare: maximumFare !== undefined ? parseFloat(maximumFare) : undefined,
      });

      await AuditService.log('FARE_RULES_UPDATED', 'FARE_RULES', { updated }, {
        userId: req.user?.id,
        role: req.user?.role,
        ipAddress: req.ip,
      });

      res.json({ success: true, message: 'Fare rules updated successfully', fareRules: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Audit Logs
   */
  static async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const logs = await AuditService.getRecentLogs(limit);
      res.json({ success: true, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
