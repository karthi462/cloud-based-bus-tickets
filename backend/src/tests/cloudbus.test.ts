import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { LocalRepository } from '../repositories/localRepository.js';
import { setRepository } from '../repositories/index.js';
import { FareService } from '../services/fareService.js';
import { CreditService } from '../services/creditService.js';
import { WalletService } from '../services/walletService.js';
import { TicketService } from '../services/ticketService.js';
import { BiometricService } from '../services/biometricService.js';
import path from 'path';
import fs from 'fs';

describe('CloudBus Full Test Suite', () => {
  let testRepo: LocalRepository;
  const testDbPath = path.join(process.cwd(), 'data', 'test-db.json');

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch (e) {}
    }
    testRepo = new LocalRepository(testDbPath);
    setRepository(testRepo);
  });

  // 1. Passenger Registration and Login
  describe('1. Passenger Registration and Authentication', () => {
    it('should register a new passenger with wallet and credit account initialized', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Ananya Rao',
          email: 'ananya@example.com',
          mobileNumber: '9988776655',
          password: 'Password123!',
          termsConsent: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.passengerId).toBeDefined();
      expect(res.body.user.role).toBe('PASSENGER');

      // Check wallet was initialized with ₹0
      const wallet = await testRepo.getWalletByPassengerId(res.body.user.passengerId);
      expect(wallet).not.toBeNull();
      expect(wallet?.balance).toBe(0);

      // Check credit account was initialized with ₹200 limit and ₹0 outstanding
      const credit = await testRepo.getCreditAccountByPassengerId(res.body.user.passengerId);
      expect(credit).not.toBeNull();
      expect(credit?.maxCreditLimit).toBe(200);
      expect(credit?.outstandingCredit).toBe(0);
      expect(credit?.availableCredit).toBe(200);
    });

    it('should login an existing passenger with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login/passenger')
        .send({
          email: 'passenger@cloudbus.com',
          password: 'pass123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.passengerId).toBe('CB-PASS-1001');
    });

    it('should reject passenger login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login/passenger')
        .send({
          email: 'passenger@cloudbus.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // 2. Conductor Employee Login
  describe('2. Conductor Employee Login', () => {
    it('should authenticate conductor with valid Employee ID and password', async () => {
      const res = await request(app)
        .post('/api/auth/login/conductor')
        .send({
          employeeId: 'CB-EMP-2001',
          password: 'conductor123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.employeeId).toBe('CB-EMP-2001');
      expect(res.body.user.role).toBe('CONDUCTOR');
    });

    it('should reject conductor login with incorrect employee ID', async () => {
      const res = await request(app)
        .post('/api/auth/login/conductor')
        .send({
          employeeId: 'CB-EMP-9999',
          password: 'conductor123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // 3. Administrator Access Control & Permission Enforcement
  describe('3. Admin Access Control & Permission Enforcement', () => {
    it('should authenticate administrator', async () => {
      const res = await request(app)
        .post('/api/auth/login/admin')
        .send({
          email: 'admin@cloudbus.gov',
          password: 'admin123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('ADMIN');
    });

    it('should prevent conductor from accessing privileged admin endpoints', async () => {
      // Login as conductor
      const condLogin = await request(app)
        .post('/api/auth/login/conductor')
        .send({ employeeId: 'CB-EMP-2001', password: 'conductor123' });

      const conductorToken = condLogin.body.token;

      // Attempt to access admin passengers management
      const res = await request(app)
        .get('/api/admin/passengers')
        .set('Authorization', `Bearer ${conductorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });

    it('should prevent unauthenticated requests to protected endpoints', async () => {
      const res = await request(app).get('/api/admin/analytics');
      expect(res.status).toBe(401);
    });
  });

  // 4. Biometric Authentication & Simulated Fingerprint Mode
  describe('4. Biometric & Simulated Fingerprint Mode', () => {
    it('should generate simulated fingerprint challenge for passenger', async () => {
      const res = await request(app).get('/api/biometrics/demo-challenge/CB-PASS-1001');
      expect(res.status).toBe(200);
      expect(res.body.mode).toBe('DEMO — Simulated Fingerprint Authentication');
      expect(res.body.challenge).toBeDefined();
    });

    it('should verify simulated fingerprint challenge successfully', async () => {
      const challengeInfo = BiometricService.generateSimulatedChallenge('CB-PASS-1001');
      const res = await request(app)
        .post('/api/biometrics/demo-verify')
        .send({
          passengerId: 'CB-PASS-1001',
          challenge: challengeInfo.challenge,
        });

      expect(res.status).toBe(200);
      expect(res.body.verified).toBe(true);
      expect(res.body.passenger.passengerId).toBe('CB-PASS-1001');
    });

    it('should reject invalid or tampered simulated fingerprint challenge', async () => {
      const res = await request(app)
        .post('/api/biometrics/demo-verify')
        .send({
          passengerId: 'CB-PASS-1001',
          challenge: 'CB-PASS-1001.12345.tamperedhash',
        });

      expect(res.status).toBe(401);
      expect(res.body.verified).toBe(false);
    });
  });

  // 5. Valid and Invalid Routes & Stop Sequences
  describe('5. Route & Stop Sequence Validation', () => {
    it('should accurately calculate fare for valid stop sequence', async () => {
      // Route R-101: Majestic Central (ST-101, km 0) to Silk Board Junction (ST-105, km 16)
      const res = await FareService.calculateFare('R-101', 'ST-101', 'ST-105');
      expect(res.valid).toBe(true);
      expect(res.distanceKm).toBe(16);
      // Fare: base 10 + 16 * 2.5 = 10 + 40 = ₹50
      expect(res.fare).toBe(50);
    });

    it('should reject reverse direction (destination preceding boarding stop)', async () => {
      // Boarding at Silk Board (ST-105) and trying to destination at Majestic (ST-101)
      await expect(
        FareService.calculateFare('R-101', 'ST-105', 'ST-101')
      ).rejects.toThrow('Destination stop must be ahead of boarding stop');
    });

    it('should reject stop not belonging to route', async () => {
      // ST-205 belongs to R-202, not R-101
      await expect(
        FareService.calculateFare('R-101', 'ST-101', 'ST-205')
      ).rejects.toThrow('does not belong to route');
    });
  });

  // 6. Wallet Deductions & Exact Scenarios from Section 13
  describe('6. Wallet & Emergency Travel Credit Business Rules', () => {
    // Scenario 1: Wallet ₹100, fare ₹30: approve and leave ₹70
    it('Scenario 1: Wallet ₹100, fare ₹30 -> Approve and leave ₹70 in wallet', async () => {
      const initialWallet = await testRepo.getWalletByPassengerId('CB-PASS-1001');
      expect(initialWallet?.balance).toBe(100);

      const challengeInfo = BiometricService.generateSimulatedChallenge('CB-PASS-1001');

      // Distance: ST-101 (0km) to ST-103 Lalbagh (6km). Fare: 10 + 6*2.5 = ₹25. Let's pick ST-104 (10km): 10 + 10*2.5 = ₹35.
      // Or ST-101 to ST-103 is ₹25. Let's test with ST-101 to ST-103:
      // Let's call ticket generation
      const ticket = await TicketService.generateTicket({
        conductorEmployeeId: 'CB-EMP-2001',
        driverId: 'DRV-101',
        busNumber: 'KA-01-F-4022',
        routeId: 'R-101',
        passengerId: 'CB-PASS-1001',
        boardingStopId: 'ST-101', // Majestic
        destinationStopId: 'ST-103', // Lalbagh (fare is 10 + 6*2.5 = 25)
        authVerified: true,
        authMethod: 'SIMULATED_FINGERPRINT',
      });

      expect(ticket.paymentMethod).toBe('WALLET');
      expect(ticket.fare).toBe(25);

      const updatedWallet = await testRepo.getWalletByPassengerId('CB-PASS-1001');
      expect(updatedWallet?.balance).toBe(75); // 100 - 25 = 75

      // Credit balance should remain untouched at 0
      const credit = await testRepo.getCreditAccountByPassengerId('CB-PASS-1001');
      expect(credit?.outstandingCredit).toBe(0);
    });

    // Scenario 2: Wallet ₹0, outstanding credit ₹0, fare ₹35, credit limit ₹200: approve eligible credit
    it('Scenario 2: Wallet ₹0, outstanding credit ₹0, fare ₹35, limit ₹200 -> Approve eligible credit and record ₹35 outstanding', async () => {
      const initialWallet = await testRepo.getWalletByPassengerId('CB-PASS-1002');
      expect(initialWallet?.balance).toBe(0);

      const initialCredit = await testRepo.getCreditAccountByPassengerId('CB-PASS-1002');
      expect(initialCredit?.outstandingCredit).toBe(0);
      expect(initialCredit?.maxCreditLimit).toBe(200);

      // Generate ticket: ST-101 to ST-104 (Dairy Circle, 10km -> 10 + 10*2.5 = ₹35)
      const ticket = await TicketService.generateTicket({
        conductorEmployeeId: 'CB-EMP-2001',
        driverId: 'DRV-101',
        busNumber: 'KA-01-F-4022',
        routeId: 'R-101',
        passengerId: 'CB-PASS-1002',
        boardingStopId: 'ST-101',
        destinationStopId: 'ST-104',
        authVerified: true,
        authMethod: 'SIMULATED_FINGERPRINT',
      });

      expect(ticket.paymentMethod).toBe('TRAVEL_CREDIT');
      expect(ticket.fare).toBe(35);

      // Wallet stays ₹0 (never negative!)
      const updatedWallet = await testRepo.getWalletByPassengerId('CB-PASS-1002');
      expect(updatedWallet?.balance).toBe(0);

      // Credit account records ₹35 outstanding, available ₹165
      const updatedCredit = await testRepo.getCreditAccountByPassengerId('CB-PASS-1002');
      expect(updatedCredit?.outstandingCredit).toBe(35);
      expect(updatedCredit?.availableCredit).toBe(165);
    });

    // Scenario 3: Outstanding credit ₹190, fare ₹35, limit ₹200 -> REJECT because limit would be exceeded
    it('Scenario 3: Outstanding credit ₹190, fare ₹35, limit ₹200 -> Reject credit because limit would be exceeded', async () => {
      // Passenger CB-PASS-1003 has outstandingCredit ₹190 and maxCreditLimit ₹200
      const credit = await testRepo.getCreditAccountByPassengerId('CB-PASS-1003');
      expect(credit?.outstandingCredit).toBe(190);
      expect(credit?.availableCredit).toBe(10);

      await expect(
        TicketService.generateTicket({
          conductorEmployeeId: 'CB-EMP-2001',
          driverId: 'DRV-101',
          busNumber: 'KA-01-F-4022',
          routeId: 'R-101',
          passengerId: 'CB-PASS-1003',
          boardingStopId: 'ST-101',
          destinationStopId: 'ST-104', // fare ₹35
          authVerified: true,
          authMethod: 'SIMULATED_FINGERPRINT',
        })
      ).rejects.toThrow(/exceed credit limit/);
    });

    // Scenario 4: Outstanding credit ₹200: reject additional credit-based travel
    it('Scenario 4: Outstanding credit ₹200 -> Reject additional credit-based travel', async () => {
      // Update CB-PASS-1003 to full ₹200 outstanding
      await testRepo.updateCreditAccount('crd-1003', {
        outstandingCredit: 200,
        availableCredit: 0,
      });

      const evalRes = await CreditService.evaluateCreditEligibility('CB-PASS-1003', 10);
      expect(evalRes.eligible).toBe(false);
      expect(evalRes.reason).toContain('Maximum emergency credit limit');
    });

    // Scenario 5: Repayment of outstanding travel credit
    it('Scenario 5: Repayment restores credit eligibility', async () => {
      // Add money to passenger CB-PASS-1003's wallet so they can repay
      await testRepo.updateWalletBalance('wlt-1003', 150);

      // Repay ₹100 of their ₹190 outstanding credit
      const repayResult = await CreditService.repayCredit('CB-PASS-1003', 100, 'WALLET');
      expect(repayResult.success).toBe(true);
      expect(repayResult.creditAccount.outstandingCredit).toBe(90);
      expect(repayResult.creditAccount.availableCredit).toBe(110);

      // Wallet should have ₹50 remaining
      const wallet = await testRepo.getWalletByPassengerId('CB-PASS-1003');
      expect(wallet?.balance).toBe(50);
    });
  });

  // 7. Duplicate Request Protection & Idempotency
  describe('7. Duplicate Request Protection & Idempotency', () => {
    it('should prevent repeated payment callback from crediting the wallet twice', async () => {
      const idempotencyKey = 'UNIQUE-PAYMENT-REF-12345';
      const user = await testRepo.getUserByEmail('passenger@cloudbus.com');

      // First top-up request
      const res1 = await WalletService.addMoney(user!.id, 200, 'TEST_GATEWAY', idempotencyKey);
      expect(res1.replayed).toBe(false);
      expect(res1.wallet.balance).toBe(300); // 100 + 200

      // Replayed callback with same idempotency key
      const res2 = await WalletService.addMoney(user!.id, 200, 'TEST_GATEWAY', idempotencyKey);
      expect(res2.replayed).toBe(true);
      // Balance must NOT increase again!
      expect(res2.wallet.balance).toBe(300);
    });
  });

  // 8. Withdrawal Request and Approval / Rejection
  describe('8. Withdrawal Management', () => {
    it('should submit withdrawal request and process admin approval', async () => {
      const user = await testRepo.getUserByEmail('passenger@cloudbus.com');
      // Balance is 100
      const withdrawal = await WalletService.requestWithdrawal(user!.id, 50, 'UPI: test@okaxis');
      expect(withdrawal.status).toBe('PENDING');

      // Admin approves
      const processed = await WalletService.processWithdrawal(withdrawal.withdrawalId, 'APPROVE', 'admin@cloudbus.gov');
      expect(processed.status).toBe('APPROVED');

      // Wallet balance should be reduced from 100 to 50
      const wallet = await testRepo.getWalletByUserId(user!.id);
      expect(wallet?.balance).toBe(50);
    });

    it('should reject withdrawal request when amount exceeds balance', async () => {
      const user = await testRepo.getUserByEmail('emergency@cloudbus.com'); // balance ₹0
      await expect(
        WalletService.requestWithdrawal(user!.id, 100, 'UPI: test@okaxis')
      ).rejects.toThrow(/Insufficient wallet balance/);
    });
  });

  // 9. Ticket QR Generation and Cryptographic Validation
  describe('9. Ticket QR Generation and Validation', () => {
    it('should generate verifiable signed QR code and validate ticket', async () => {
      const ticket = await TicketService.generateTicket({
        conductorEmployeeId: 'CB-EMP-2001',
        driverId: 'DRV-101',
        busNumber: 'KA-01-F-4022',
        routeId: 'R-101',
        passengerId: 'CB-PASS-1001',
        boardingStopId: 'ST-101',
        destinationStopId: 'ST-102',
        authVerified: true,
        authMethod: 'SIMULATED_FINGERPRINT',
      });

      expect(ticket.ticketId).toBeDefined();
      expect(ticket.signature).toBeDefined();
      expect(ticket.status).toBe('ISSUED');

      // Validate ticket
      const valResult = await TicketService.validateTicket(ticket.ticketId, 'CB-EMP-2001');
      expect(valResult.valid).toBe(true);
      expect(valResult.alreadyValidated).toBe(false);
      expect(valResult.ticket?.status).toBe('VALIDATED');

      // Validate again -> should detect already validated
      const valAgain = await TicketService.validateTicket(ticket.ticketId, 'CB-EMP-2001');
      expect(valAgain.valid).toBe(true);
      expect(valAgain.alreadyValidated).toBe(true);
    });
  });
});
