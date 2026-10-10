import { Request, Response } from 'express';
import { BiometricService } from '../services/biometricService.js';
import { getRepository } from '../repositories/index.js';
import { AuditService } from '../services/auditService.js';

export class BiometricController {
  /**
   * WebAuthn: Registration challenge
   */
  static async registerOptions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const repo = getRepository();
      const user = await repo.getUserById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const options = await BiometricService.getRegistrationOptions(userId, user.email);
      res.json({ success: true, options });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error generating biometric registration challenge' });
    }
  }

  /**
   * WebAuthn: Verify registration response
   */
  static async verifyRegistration(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { response } = req.body;
      const verified = await BiometricService.verifyRegistration(userId, response);

      if (verified) {
        await AuditService.log('BIOMETRIC_ENROLLMENT_WEBAUTHN', 'CREDENTIALS', { userId }, {
          userId,
          role: req.user?.role,
          ipAddress: req.ip,
        });

        res.json({
          success: true,
          message: 'Biometric passkey authenticator enrolled successfully',
        });
      } else {
        res.status(400).json({ success: false, message: 'Failed to verify biometric registration response' });
      }
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Verification failed' });
    }
  }

  /**
   * WebAuthn: Authentication options
   */
  static async authOptions(req: Request, res: Response): Promise<void> {
    try {
      const { passengerId } = req.query;
      let targetUserId: string | undefined = undefined;

      if (passengerId) {
        const repo = getRepository();
        const profile = await repo.getPassengerProfileByPassengerId(passengerId as string);
        if (profile) targetUserId = profile.userId;
      }

      const options = await BiometricService.getAuthenticationOptions(targetUserId);
      res.json({ success: true, options });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * WebAuthn: Verify authentication
   */
  static async verifyAuth(req: Request, res: Response): Promise<void> {
    try {
      const { passengerId, response } = req.body;
      if (!passengerId || !response) {
        res.status(400).json({ success: false, message: 'passengerId and response are required' });
        return;
      }

      const repo = getRepository();
      const profile = await repo.getPassengerProfileByPassengerId(passengerId);
      if (!profile) {
        res.status(404).json({ success: false, message: 'Passenger not found' });
        return;
      }

      const verified = await BiometricService.verifyAuthentication(profile.userId, response);
      if (verified) {
        res.json({
          success: true,
          verified: true,
          passengerId: profile.passengerId,
          fullName: profile.fullName,
          message: 'Biometric fingerprint/passkey verified successfully',
        });
      } else {
        res.status(401).json({ success: false, verified: false, message: 'Biometric verification failed' });
      }
    } catch (err: any) {
      res.status(400).json({ success: false, verified: false, message: err.message });
    }
  }

  /**
   * CLASSROOM DEMO: Get Simulated Fingerprint Challenge
   */
  static async getDemoChallenge(req: Request, res: Response): Promise<void> {
    try {
      const passengerId = req.params.passengerId as string;
      const repo = getRepository();
      const profile = await repo.getPassengerProfileByPassengerId(passengerId);

      if (!profile) {
        res.status(404).json({ success: false, message: 'Passenger ID not recognized' });
        return;
      }

      const challengeInfo = BiometricService.generateSimulatedChallenge(passengerId);
      res.json({
        success: true,
        mode: 'DEMO — Simulated Fingerprint Authentication',
        passengerId,
        passengerName: profile.fullName,
        challenge: challengeInfo.challenge,
        expiresAt: challengeInfo.expiresAt,
        notice: 'Academic simulation mode: No raw biological fingerprint scans are collected or stored.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * CLASSROOM DEMO: Verify Simulated Fingerprint Scan
   */
  static async verifyDemoScan(req: Request, res: Response): Promise<void> {
    try {
      const { passengerId, challenge } = req.body;
      if (!passengerId || !challenge) {
        res.status(400).json({ success: false, message: 'passengerId and challenge are required' });
        return;
      }

      const repo = getRepository();
      const profile = await repo.getPassengerProfileByPassengerId(passengerId);
      if (!profile) {
        res.status(404).json({ success: false, message: 'Passenger not found' });
        return;
      }

      const isValid = BiometricService.verifySimulatedBiometric(passengerId, challenge);
      if (!isValid) {
        res.status(401).json({
          success: false,
          verified: false,
          message: 'Simulated fingerprint verification failed or token expired',
        });
        return;
      }

      const wallet = await repo.getWalletByPassengerId(passengerId);
      const creditAccount = await repo.getCreditAccountByPassengerId(passengerId);

      res.json({
        success: true,
        verified: true,
        mode: 'DEMO — Simulated Fingerprint Authentication',
        passenger: {
          passengerId: profile.passengerId,
          fullName: profile.fullName,
          walletBalance: wallet?.balance || 0,
          outstandingCredit: creditAccount?.outstandingCredit || 0,
          availableCredit: creditAccount?.availableCredit || 0,
          creditLimit: creditAccount?.maxCreditLimit || 200,
        },
        message: 'Fingerprint match verified (Simulated Demonstration Protocol)',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * 1:N BIOMETRIC TOUCH-TO-IDENTIFY:
   * Conductor terminal biometric sensor captures fingerprint token/minutiae hash.
   * System scans database, automatically identifies passenger, fetches Aadhaar card details,
   * wallet balance, and emergency travel credit eligibility without requiring manual Passenger ID typing!
   */
  static async touchIdentify(req: Request, res: Response): Promise<void> {
    try {
      const { fingerprintTemplateId, sensorScanToken } = req.body;
      const templateId = fingerprintTemplateId || sensorScanToken;

      if (!templateId) {
        res.status(400).json({
          success: false,
          verified: false,
          message: 'Biometric fingerprint scan data / template ID is required',
        });
        return;
      }

      const repo = getRepository();
      const profile = await repo.getPassengerProfileByFingerprint(templateId);

      if (!profile) {
        res.status(404).json({
          success: false,
          verified: false,
          message: `Fingerprint scan unrecognized (Template: ${templateId}). No enrolled passenger or Aadhaar biometric profile matched this scan.`,
        });
        return;
      }

      // Check account status
      const user = await repo.getUserById(profile.userId);
      if (user && user.status === 'SUSPENDED') {
        res.status(403).json({
          success: false,
          verified: false,
          message: 'Passenger account is suspended. Biometric authentication blocked.',
        });
        return;
      }

      // Fetch financial and credit details
      const wallet = await repo.getWalletByPassengerId(profile.passengerId);
      const creditAccount = await repo.getCreditAccountByPassengerId(profile.passengerId);

      await AuditService.log('BIOMETRIC_TOUCH_IDENTIFY_SUCCESS', 'BIOMETRIC', {
        passengerId: profile.passengerId,
        templateId,
        conductorId: req.user?.id,
      }, {
        userId: req.user?.id,
        role: req.user?.role,
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        verified: true,
        mode: '1:N Biometric Touch-to-Identify',
        passenger: {
          passengerId: profile.passengerId,
          fullName: profile.fullName,
          email: profile.email,
          mobileNumber: profile.mobileNumber,
          aadhaarNumber: profile.aadhaarNumber,
          aadhaarVerified: profile.aadhaarVerified ?? true,
          gender: profile.gender,
          city: profile.city,
          fingerprintTemplateId: profile.fingerprintTemplateId,
          walletBalance: wallet?.balance ?? 0,
          outstandingCredit: creditAccount?.outstandingCredit ?? 0,
          availableCredit: creditAccount?.availableCredit ?? 200,
          creditLimit: creditAccount?.maxCreditLimit ?? 200,
        },
        message: `Biometric match confirmed: ${profile.fullName} (Aadhaar: ${profile.aadhaarNumber || 'Verified'})`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, verified: false, message: err.message });
    }
  }

  /**
   * Enrol Demo Biometric status for passenger
   */
  static async enrolDemoBiometric(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const repo = getRepository();
      const updated = await repo.updatePassengerProfile(userId, {
        biometricEnrolled: true,
        biometricType: 'SIMULATED',
      });

      await AuditService.log('BIOMETRIC_ENROLLMENT_DEMO', 'PROFILES', { userId }, {
        userId,
        role: req.user?.role,
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Demo fingerprint profile enrolled successfully',
        profile: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * List enrolled biometric passengers for demo convenience in testing
   */
  static async listEnrolledTemplates(req: Request, res: Response): Promise<void> {
    try {
      const repo = getRepository();
      const profiles = await repo.listPassengerProfiles();
      const enrolled = profiles.filter((p) => p.fingerprintTemplateId).map((p) => ({
        fingerprintTemplateId: p.fingerprintTemplateId,
        passengerId: p.passengerId,
        fullName: p.fullName,
        aadhaarNumber: p.aadhaarNumber,
      }));
      res.json({ success: true, enrolled });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
