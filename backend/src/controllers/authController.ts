import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from '../repositories/index.js';
import { CONFIG } from '../config/constants.js';
import { hashPassword, comparePassword, generateId } from '../utils/crypto.js';
import { AuditService } from '../services/auditService.js';
import { ROLE_PERMISSIONS } from '../config/permissions.js';

export class AuthController {
  /**
   * Register new Passenger
   */
  static async registerPassenger(req: Request, res: Response): Promise<void> {
    try {
      const {
        fullName,
        email,
        mobileNumber,
        password,
        termsConsent,
        dateOfBirth,
        emergencyContact,
        aadhaarNumber,
        gender,
        city,
        fingerprintTemplateId,
      } = req.body;

      if (!fullName || !email || !password || !mobileNumber) {
        res.status(400).json({ success: false, message: 'Full name, email, mobile number, and password are required' });
        return;
      }

      if (!termsConsent) {
        res.status(400).json({ success: false, message: 'You must consent to terms and privacy policy to register' });
        return;
      }

      const repo = getRepository();
      const existingUser = await repo.getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ success: false, message: 'Email is already registered' });
        return;
      }

      // Check if Aadhaar is already registered
      if (aadhaarNumber) {
        const existingAadhaar = await repo.getPassengerProfileByAadhaar(aadhaarNumber);
        if (existingAadhaar) {
          res.status(409).json({ success: false, message: 'This Aadhaar card number is already linked to another passenger account' });
          return;
        }
      }

      const userId = generateId('USR-PASS');
      const passengerId = `CB-PASS-${Math.floor(1000 + Math.random() * 9000)}`;
      const passwordHash = await hashPassword(password);
      const now = new Date().toISOString();

      const user = await repo.createUser({
        id: userId,
        email,
        passwordHash,
        role: 'PASSENGER',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      });

      // Default fingerprint template ID if enrolled or provided
      const resolvedFpId = fingerprintTemplateId || `FP-BIO-${Math.floor(1000 + Math.random() * 9000)}`;

      const profile = await repo.createPassengerProfile({
        userId,
        passengerId,
        fullName,
        email,
        mobileNumber,
        dateOfBirth,
        emergencyContact,
        aadhaarNumber: aadhaarNumber || undefined,
        aadhaarVerified: !!aadhaarNumber,
        gender: gender || 'Not Specified',
        city: city || 'Chennai',
        fingerprintTemplateId: resolvedFpId,
        biometricEnrolled: true,
        biometricType: 'SIMULATED',
        termsConsent: true,
        createdAt: now,
        updatedAt: now,
      });

      // Initialize persistent wallet with ₹0
      await repo.createWallet({
        walletId: `wlt-${passengerId}`,
        userId,
        passengerId,
        balance: 0,
        currency: 'INR',
        lastUpdated: now,
      });

      // Initialize emergency travel credit account with default limit (₹200)
      await repo.createCreditAccount({
        creditAccountId: `crd-${passengerId}`,
        userId,
        passengerId,
        maxCreditLimit: CONFIG.DEFAULT_CREDIT_LIMIT,
        outstandingCredit: 0,
        availableCredit: CONFIG.DEFAULT_CREDIT_LIMIT,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      });

      await AuditService.log('PASSENGER_REGISTRATION', 'USERS', { userId, passengerId, email }, {
        userId,
        role: 'PASSENGER',
        ipAddress: req.ip,
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        CONFIG.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'Passenger registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          passengerId: profile.passengerId,
          fullName: profile.fullName,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Registration failed' });
    }
  }

  /**
   * Passenger Login
   */
  static async loginPassenger(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required' });
        return;
      }

      const repo = getRepository();
      const user = await repo.getUserByEmail(email);
      if (!user || user.role !== 'PASSENGER') {
        res.status(401).json({ success: false, message: 'Invalid passenger email or credentials' });
        return;
      }

      if (user.status === 'SUSPENDED') {
        res.status(403).json({ success: false, message: 'Passenger account is suspended. Please contact administrator.' });
        return;
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        await AuditService.log('AUTH_FAILURE', 'USERS', { email, role: 'PASSENGER' }, { ipAddress: req.ip }, 'FAILURE');
        res.status(401).json({ success: false, message: 'Invalid password' });
        return;
      }

      const profile = await repo.getPassengerProfileByUserId(user.id);
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        CONFIG.JWT_SECRET,
        { expiresIn: '24h' }
      );

      await AuditService.log('AUTH_SUCCESS', 'USERS', { userId: user.id, role: user.role }, {
        userId: user.id,
        role: user.role,
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          passengerId: profile?.passengerId,
          fullName: profile?.fullName,
          biometricEnrolled: profile?.biometricEnrolled,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Login failed' });
    }
  }

  /**
   * Conductor Login by Employee ID & Password
   */
  static async loginConductor(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, password } = req.body;
      if (!employeeId || !password) {
        res.status(400).json({ success: false, message: 'Employee ID and password are required' });
        return;
      }

      const repo = getRepository();
      const conductor = await repo.getConductorProfileByEmployeeId(employeeId);
      if (!conductor) {
        res.status(401).json({ success: false, message: 'Invalid employee ID or unauthorized conductor' });
        return;
      }

      if (conductor.status !== 'ACTIVE') {
        res.status(403).json({ success: false, message: 'Conductor employee profile is inactive' });
        return;
      }

      const user = await repo.getUserById(conductor.userId);
      if (!user || user.role !== 'CONDUCTOR' || user.status === 'SUSPENDED') {
        res.status(401).json({ success: false, message: 'Conductor account disabled or unauthorized' });
        return;
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        await AuditService.log('AUTH_FAILURE', 'CONDUCTORS', { employeeId }, { ipAddress: req.ip }, 'FAILURE');
        res.status(401).json({ success: false, message: 'Invalid password' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        CONFIG.JWT_SECRET,
        { expiresIn: '24h' }
      );

      await AuditService.log('AUTH_SUCCESS', 'CONDUCTORS', { employeeId, userId: user.id }, {
        userId: user.id,
        role: user.role,
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          employeeId: conductor.employeeId,
          fullName: conductor.fullName,
          assignedBusId: conductor.assignedBusId,
          assignedRouteId: conductor.assignedRouteId,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Login failed' });
    }
  }

  /**
   * Administrator Login
   */
  static async loginAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required' });
        return;
      }

      const repo = getRepository();
      const user = await repo.getUserByEmail(email);
      if (!user || user.role !== 'ADMIN') {
        res.status(401).json({ success: false, message: 'Invalid administrator credentials' });
        return;
      }

      if (user.status === 'SUSPENDED') {
        res.status(403).json({ success: false, message: 'Administrator account suspended' });
        return;
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        await AuditService.log('AUTH_FAILURE', 'ADMIN', { email }, { ipAddress: req.ip }, 'FAILURE');
        res.status(401).json({ success: false, message: 'Invalid administrator password' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        CONFIG.JWT_SECRET,
        { expiresIn: '24h' }
      );

      await AuditService.log('AUTH_SUCCESS', 'ADMIN', { userId: user.id }, {
        userId: user.id,
        role: user.role,
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: 'CloudBus System Administrator',
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Admin login failed' });
    }
  }

  /**
   * Get Current Authenticated User Details
   */
  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const repo = getRepository();
      const user = await repo.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      let profile: any = null;
      let wallet: any = null;
      let creditAccount: any = null;

      if (user.role === 'PASSENGER') {
        profile = await repo.getPassengerProfileByUserId(user.id);
        if (profile) {
          wallet = await repo.getWalletByPassengerId(profile.passengerId);
          creditAccount = await repo.getCreditAccountByPassengerId(profile.passengerId);
        }
      } else if (user.role === 'CONDUCTOR') {
        profile = await repo.getConductorProfileByUserId(user.id);
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          profile,
          wallet,
          creditAccount,
          permissions: ROLE_PERMISSIONS[user.role] || [],
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error fetching user' });
    }
  }
}
