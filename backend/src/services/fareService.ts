import { getRepository } from '../repositories/index.js';
import { Route, RouteStop, FareRules } from '../models/types.js';

export interface FareCalculationResult {
  valid: boolean;
  fare: number;
  distanceKm: number;
  boardingStop: RouteStop;
  destinationStop: RouteStop;
  error?: string;
}

export class FareService {
  static async calculateFare(
    routeId: string,
    boardingStopId: string,
    destinationStopId: string
  ): Promise<FareCalculationResult> {
    const repo = getRepository();
    const route = await repo.getRouteById(routeId);
    if (!route) {
      throw new Error(`Route with ID ${routeId} not found`);
    }

    const stops = route.stops || [];
    const boardIndex = stops.findIndex((s) => s.stopId === boardingStopId);
    const destIndex = stops.findIndex((s) => s.stopId === destinationStopId);

    if (boardIndex === -1) {
      throw new Error(`Boarding stop ${boardingStopId} does not belong to route ${route.routeNumber}`);
    }

    if (destIndex === -1) {
      throw new Error(`Destination stop ${destinationStopId} does not belong to route ${route.routeNumber}`);
    }

    // Direction check: Destination must follow boarding stop
    if (destIndex <= boardIndex) {
      throw new Error('Destination stop must be ahead of boarding stop along route direction');
    }

    const boardStop = stops[boardIndex];
    const destStop = stops[destIndex];

    const distanceKm = Math.max(0.5, destStop.distanceFromStartKm - boardStop.distanceFromStartKm);
    const fareRules = await repo.getFareRules();

    // Fare calculation formula: Base Fare + (Distance * perKmRate)
    let rawFare = fareRules.baseFare + (distanceKm * fareRules.perKmRate);
    
    // Round to nearest integer (standard transport ticketing practice in India)
    let calculatedFare = Math.round(rawFare);

    // Apply minimum and maximum fare bounds
    if (calculatedFare < fareRules.minimumFare) {
      calculatedFare = fareRules.minimumFare;
    }
    if (calculatedFare > fareRules.maximumFare) {
      calculatedFare = fareRules.maximumFare;
    }

    return {
      valid: true,
      fare: calculatedFare,
      distanceKm,
      boardingStop: boardStop,
      destinationStop: destStop,
    };
  }
}
