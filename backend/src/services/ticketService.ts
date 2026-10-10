import QRCode from 'qrcode';
import { getRepository } from '../repositories/index.js';
import { Ticket, PaymentMethod, WalletTransaction } from '../models/types.js';
import { FareService } from './fareService.js';
import { CreditService } from './creditService.js';
import { generateId, signTicketData, verifyTicketSignature } from '../utils/crypto.js';

export interface GenerateTicketRequest {
  conductorEmployeeId: string;
  driverId: string;
  busNumber: string;
  routeId: string;
  passengerId: string;
  boardingStopId: string;
  destinationStopId: string;
  authVerified: boolean;
  authMethod: 'WEBAUTHN' | 'SIMULATED_FINGERPRINT';
  authProof?: string; // challenge or signature
}

export class TicketService {
  /**
   * Complete atomic workflow for conductor-generated bus ticket
   */
  static async generateTicket(request: GenerateTicketRequest): Promise<Ticket> {
    const repo = getRepository();

    // Step 1: Verify passenger authentication
    if (!request.authVerified) {
      throw new Error('Passenger authentication failed: Biometric verification required to issue ticket');
    }

    // Step 2: Validate conductor
    const conductor = await repo.getConductorProfileByEmployeeId(request.conductorEmployeeId);
    if (!conductor || conductor.status !== 'ACTIVE') {
      throw new Error(`Conductor employee ${request.conductorEmployeeId} not authorized or inactive`);
    }

    // Step 3: Validate driver & bus
    const driver = await repo.getDriverById(request.driverId);
    if (!driver || driver.status !== 'ACTIVE') {
      throw new Error(`Driver with ID ${request.driverId} not authorized`);
    }

    const bus = await repo.getBusByNumber(request.busNumber);
    if (!bus || bus.status !== 'ACTIVE') {
      throw new Error(`Bus ${request.busNumber} is not active or authorized`);
    }

    // Step 4: Validate passenger account
    const passenger = await repo.getPassengerProfileByPassengerId(request.passengerId);
    if (!passenger) {
      throw new Error(`Passenger ${request.passengerId} not found`);
    }

    const user = await repo.getUserById(passenger.userId);
    if (!user || user.status === 'SUSPENDED') {
      throw new Error(`Passenger account is suspended`);
    }

    // Step 5: Route & Stops validation and fare calculation
    const route = await repo.getRouteById(request.routeId);
    if (!route || route.status !== 'ACTIVE') {
      throw new Error(`Route ${request.routeId} not found or inactive`);
    }

    const fareResult = await FareService.calculateFare(
      request.routeId,
      request.boardingStopId,
      request.destinationStopId
    );

    const fare = fareResult.fare;

    // Step 6: Payment method resolution (Wallet vs Emergency Travel Credit)
    const wallet = await repo.getWalletByPassengerId(request.passengerId);
    if (!wallet) {
      throw new Error(`Wallet not found for passenger ${request.passengerId}`);
    }

    let paymentMethod: PaymentMethod = 'WALLET';
    let walletUpdate: { walletId: string; newBalance: number; transaction: WalletTransaction } | undefined;
    let creditUpdate: { creditAccountId: string; newOutstandingCredit: number; newAvailableCredit: number } | undefined;

    if (wallet.balance >= fare) {
      // Deduct from wallet
      paymentMethod = 'WALLET';
      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore - fare;

      walletUpdate = {
        walletId: wallet.walletId,
        newBalance: balanceAfter,
        transaction: {
          transactionId: generateId('TX-FARE'),
          walletId: wallet.walletId,
          userId: wallet.userId,
          amount: fare,
          type: 'FARE_DEDUCTION',
          referenceId: `ROUTE-${route.routeNumber}`,
          balanceBefore,
          balanceAfter,
          status: 'SUCCESS',
          description: `Bus fare: ${fareResult.boardingStop.stopName} to ${fareResult.destinationStop.stopName}`,
          createdAt: new Date().toISOString(),
        },
      };
    } else {
      // Wallet balance is insufficient -> evaluate Emergency Travel Credit
      paymentMethod = 'TRAVEL_CREDIT';
      const creditEval = await CreditService.evaluateCreditEligibility(request.passengerId, fare);

      if (!creditEval.eligible || !creditEval.creditAccount) {
        throw new Error(creditEval.reason || 'Payment rejected: Insufficient wallet balance and travel credit limit exceeded');
      }

      creditUpdate = {
        creditAccountId: creditEval.creditAccount.creditAccountId,
        newOutstandingCredit: creditEval.newOutstandingCredit!,
        newAvailableCredit: creditEval.newAvailableCredit!,
      };
    }

    // Step 7: Create Ticket with Cryptographic Signature & Verifiable QR code
    const ticketId = generateId('TKT');
    const now = new Date().toISOString();

    const signPayload = {
      ticketId,
      passengerId: passenger.passengerId,
      busNumber: bus.busNumber,
      routeId: route.routeId,
      boardingStopId: fareResult.boardingStop.stopId,
      destinationStopId: fareResult.destinationStop.stopId,
      fare,
      paymentMethod,
      issuedAt: now,
    };

    const signature = signTicketData(signPayload);

    // QR code payload contains verifiable references without leaking private passenger info
    const qrPayload = JSON.stringify({
      tId: ticketId,
      pId: passenger.passengerId,
      bus: bus.busNumber,
      rt: route.routeNumber,
      fr: fare,
      pm: paymentMethod,
      ts: now,
      sig: signature,
    });

    const ticket: Ticket = {
      ticketId,
      qrCodeData: qrPayload,
      passengerId: passenger.passengerId,
      passengerName: passenger.fullName,
      conductorEmployeeId: conductor.employeeId,
      conductorName: conductor.fullName,
      driverId: driver.driverId,
      driverName: driver.fullName,
      busNumber: bus.busNumber,
      routeId: route.routeId,
      routeName: route.routeName,
      boardingStopId: fareResult.boardingStop.stopId,
      boardingStopName: fareResult.boardingStop.stopName,
      destinationStopId: fareResult.destinationStop.stopId,
      destinationStopName: fareResult.destinationStop.stopName,
      fare,
      paymentMethod,
      status: 'ISSUED',
      issuedAt: now,
      signature,
    };

    // Step 8: Execute atomic database write
    return repo.createTicketWithPayment(ticket, walletUpdate, creditUpdate);
  }

  /**
   * Validate ticket authenticity and update status
   */
  static async validateTicket(ticketId: string, conductorEmployeeId: string): Promise<{
    valid: boolean;
    ticket?: Ticket;
    message: string;
    alreadyValidated?: boolean;
  }> {
    const repo = getRepository();
    const ticket = await repo.getTicketById(ticketId);

    if (!ticket) {
      return { valid: false, message: 'Ticket not found or invalid ticket identifier' };
    }

    // Verify cryptographic signature
    const payloadToVerify = {
      ticketId: ticket.ticketId,
      passengerId: ticket.passengerId,
      busNumber: ticket.busNumber,
      routeId: ticket.routeId,
      boardingStopId: ticket.boardingStopId,
      destinationStopId: ticket.destinationStopId,
      fare: ticket.fare,
      paymentMethod: ticket.paymentMethod,
      issuedAt: ticket.issuedAt,
    };

    const isSignatureValid = verifyTicketSignature(payloadToVerify, ticket.signature);
    if (!isSignatureValid) {
      return { valid: false, message: 'Ticket signature verification failed: Tampered or invalid ticket' };
    }

    if (ticket.status === 'VALIDATED') {
      return {
        valid: true,
        alreadyValidated: true,
        ticket,
        message: `Ticket was already validated at ${ticket.validatedAt} by conductor ${ticket.validatedBy}`,
      };
    }

    if (ticket.status === 'CANCELLED' || ticket.status === 'EXPIRED') {
      return {
        valid: false,
        ticket,
        message: `Ticket is ${ticket.status}`,
      };
    }

    const updated = await repo.updateTicketStatus(ticketId, 'VALIDATED', conductorEmployeeId);

    return {
      valid: true,
      alreadyValidated: false,
      ticket: updated!,
      message: 'Ticket successfully verified and marked as VALIDATED',
    };
  }

  /**
   * Generate QR Code as Data URL for frontend display or download
   */
  static async getQrCodeDataUrl(qrData: string): Promise<string> {
    return QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 250,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  }
}
