import { Request, Response } from 'express';
import { getRepository } from '../repositories/index.js';

export class ConductorController {
  /**
   * Get operational dispatch context for the conductor:
   * Drivers, Buses, Routes, Stops, and assigned equipment
   */
  static async getOperationalContext(req: Request, res: Response): Promise<void> {
    try {
      const repo = getRepository();
      const userId = req.user?.id;

      const profile = userId ? await repo.getConductorProfileByUserId(userId) : null;
      const drivers = await repo.listDrivers();
      const buses = await repo.listBuses();
      const routes = await repo.listRoutes();
      const stops = await repo.listStops();

      res.json({
        success: true,
        conductor: profile,
        drivers: drivers.filter((d) => d.status === 'ACTIVE'),
        buses: buses.filter((b) => b.status === 'ACTIVE'),
        routes: routes.filter((r) => r.status === 'ACTIVE'),
        stops,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Look up passenger status by passenger ID for ticket generation
   * Protects privacy: returns only ID, masked name, biometric status, wallet balance, and credit limit.
   */
  static async lookupPassenger(req: Request, res: Response): Promise<void> {
    try {
      const passengerId = req.params.passengerId as string;
      const repo = getRepository();

      const profile = await repo.getPassengerProfileByPassengerId(passengerId);
      if (!profile) {
        res.status(404).json({ success: false, message: 'Passenger ID not recognized' });
        return;
      }

      const user = await repo.getUserById(profile.userId);
      if (!user || user.status === 'SUSPENDED') {
        res.status(403).json({ success: false, message: 'Passenger account is suspended' });
        return;
      }

      const wallet = await repo.getWalletByPassengerId(passengerId);
      const credit = await repo.getCreditAccountByPassengerId(passengerId);

      res.json({
        success: true,
        passenger: {
          passengerId: profile.passengerId,
          fullName: profile.fullName,
          biometricEnrolled: profile.biometricEnrolled,
          biometricType: profile.biometricType,
          walletBalance: wallet?.balance || 0,
          outstandingCredit: credit?.outstandingCredit || 0,
          availableCredit: credit?.availableCredit || 0,
          creditLimit: credit?.maxCreditLimit || 200,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
