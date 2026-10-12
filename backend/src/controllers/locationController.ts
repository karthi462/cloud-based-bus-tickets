import { Request, Response } from 'express';

// In-memory live bus location store
// busId → location record
interface BusLocationRecord {
  busId: string;
  busNumber: string;
  routeId: string;
  routeName: string;
  conductorEmployeeId: string;
  conductorName: string;
  latitude: number;
  longitude: number;
  speed: number; // km/h
  heading: number; // degrees 0-360
  accuracy: number; // meters
  passengerCount: number;
  nextStop: string;
  status: 'ACTIVE' | 'IDLE' | 'STOPPED';
  updatedAt: string;
}

const locationStore = new Map<string, BusLocationRecord>();

export class LocationController {
  /**
   * POST /api/location/update
   * Called by conductor app every 10 seconds with GPS coordinates
   */
  static async updateBusLocation(req: Request, res: Response): Promise<void> {
    try {
      const conductorUser = (req as any).user;
      const {
        busId,
        busNumber,
        routeId,
        routeName,
        latitude,
        longitude,
        speed = 0,
        heading = 0,
        accuracy = 10,
        passengerCount = 0,
        nextStop = 'Unknown',
        status = 'ACTIVE',
      } = req.body;

      if (!busId || latitude === undefined || longitude === undefined) {
        res.status(400).json({
          success: false,
          message: 'busId, latitude, and longitude are required',
        });
        return;
      }

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        res.status(400).json({
          success: false,
          message: 'Invalid GPS coordinates',
        });
        return;
      }

      const record: BusLocationRecord = {
        busId,
        busNumber: busNumber || busId,
        routeId: routeId || 'UNKNOWN',
        routeName: routeName || 'Unknown Route',
        conductorEmployeeId: conductorUser?.employeeId || 'UNKNOWN',
        conductorName: conductorUser?.fullName || 'Conductor',
        latitude,
        longitude,
        speed,
        heading,
        accuracy,
        passengerCount,
        nextStop,
        status,
        updatedAt: new Date().toISOString(),
      };

      locationStore.set(busId, record);

      res.json({
        success: true,
        message: 'Bus location updated',
        location: record,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * DELETE /api/location/stop
   * Called when conductor stops location sharing
   */
  static async stopBusLocation(req: Request, res: Response): Promise<void> {
    try {
      const { busId } = req.body;
      if (busId) {
        const existing = locationStore.get(busId);
        if (existing) {
          locationStore.set(busId, { ...existing, status: 'STOPPED', updatedAt: new Date().toISOString() });
        }
      }
      res.json({ success: true, message: 'Location sharing stopped' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/location/all
   * Returns all active bus locations (for passenger tracking map)
   */
  static async getAllBusLocations(req: Request, res: Response): Promise<void> {
    try {
      // Filter out stale locations (older than 2 minutes)
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
      const activeBuses: BusLocationRecord[] = [];

      for (const [busId, record] of locationStore.entries()) {
        const updatedAt = new Date(record.updatedAt).getTime();
        if (updatedAt >= twoMinutesAgo) {
          activeBuses.push(record);
        } else {
          // Mark stale buses as IDLE
          locationStore.set(busId, { ...record, status: 'IDLE' });
          activeBuses.push({ ...record, status: 'IDLE' });
        }
      }

      res.json({
        success: true,
        count: activeBuses.length,
        buses: activeBuses,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/location/bus/:busId
   * Returns location of a specific bus
   */
  static async getBusLocation(req: Request, res: Response): Promise<void> {
    try {
      const { busId } = req.params;
      const record = locationStore.get(busId as string);

      if (!record) {
        res.status(404).json({
          success: false,
          message: `Bus ${busId} is not currently sharing location`,
        });
        return;
      }

      // Check if stale
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
      const updatedAt = new Date(record.updatedAt).getTime();
      const isStale = updatedAt < twoMinutesAgo;

      res.json({
        success: true,
        bus: { ...record, status: isStale ? 'IDLE' : record.status },
        isStale,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
