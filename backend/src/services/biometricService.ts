import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import crypto from 'crypto';
import { getRepository } from '../repositories/index.js';
import { BiometricCredential } from '../models/types.js';
import { CONFIG } from '../config/constants.js';

// In-memory challenge store for WebAuthn authentication handshakes
const challenges = new Map<string, string>();

export class BiometricService {
  /**
   * WebAuthn: Step 1 - Generate Registration Options
   */
  static async getRegistrationOptions(userId: string, email: string) {
    const repo = getRepository();
    const existingCred = await repo.getBiometricCredentialByUserId(userId);

    const options = await generateRegistrationOptions({
      rpName: CONFIG.RP_NAME,
      rpID: CONFIG.RP_ID,
      userID: Buffer.from(userId, 'utf-8'),
      userName: email,
      attestationType: 'none',
      excludeCredentials: existingCred
        ? [
            {
              id: existingCred.credentialId,
              transports: existingCred.transports as any,
            },
          ]
        : [],
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    challenges.set(userId, options.challenge);
    return options;
  }

  /**
   * WebAuthn: Step 2 - Verify Registration Response
   */
  static async verifyRegistration(userId: string, response: any): Promise<boolean> {
    const expectedChallenge = challenges.get(userId);
    if (!expectedChallenge) {
      throw new Error('WebAuthn registration challenge not found or expired');
    }

    const verification: VerifiedRegistrationResponse = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: CONFIG.ORIGIN,
      expectedRPID: CONFIG.RP_ID,
    });

    challenges.delete(userId);

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;
      const repo = getRepository();

      const cred: BiometricCredential = {
        id: `bio-${userId}`,
        userId,
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString('base64'),
        counter: credential.counter,
        transports: credential.transports,
        deviceType: 'WEBAUTHN_AUTHENTICATOR',
        createdAt: new Date().toISOString(),
      };

      await repo.saveBiometricCredential(cred);
      await repo.updatePassengerProfile(userId, {
        biometricEnrolled: true,
        biometricCredentialId: credential.id,
        biometricType: 'WEBAUTHN',
      });

      return true;
    }

    return false;
  }

  /**
   * WebAuthn: Step 3 - Generate Authentication Options
   */
  static async getAuthenticationOptions(userId?: string) {
    const repo = getRepository();
    let allowCredentials: any[] | undefined = undefined;

    if (userId) {
      const cred = await repo.getBiometricCredentialByUserId(userId);
      if (cred) {
        allowCredentials = [
          {
            id: cred.credentialId,
            type: 'public-key',
            transports: cred.transports,
          },
        ];
      }
    }

    const options = await generateAuthenticationOptions({
      rpID: CONFIG.RP_ID,
      allowCredentials,
      userVerification: 'preferred',
    });

    const challengeKey = userId || 'anonymous-auth';
    challenges.set(challengeKey, options.challenge);
    return options;
  }

  /**
   * WebAuthn: Step 4 - Verify Authentication Response
   */
  static async verifyAuthentication(userId: string, response: any): Promise<boolean> {
    const repo = getRepository();
    const cred = await repo.getBiometricCredentialByUserId(userId);
    if (!cred) {
      throw new Error('Biometric credential not registered for this passenger');
    }

    const expectedChallenge = challenges.get(userId) || challenges.get('anonymous-auth');
    if (!expectedChallenge) {
      throw new Error('Authentication challenge expired or invalid');
    }

    const verification: VerifiedAuthenticationResponse = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: CONFIG.ORIGIN,
      expectedRPID: CONFIG.RP_ID,
      credential: {
        id: cred.credentialId,
        publicKey: Buffer.from(cred.publicKey, 'base64'),
        counter: cred.counter,
        transports: cred.transports as any,
      },
    });

    challenges.delete(userId);
    challenges.delete('anonymous-auth');

    if (verification.verified) {
      // Update counter to protect against replay attacks
      cred.counter = verification.authenticationInfo.newCounter;
      await repo.saveBiometricCredential(cred);
      return true;
    }

    return false;
  }

  /**
   * CLASSROOM DEMO SIMULATION:
   * Provides classroom-friendly biometric simulation that does NOT store or process raw fingerprint scans.
   * Uses cryptographically signed session tokens.
   */
  static generateSimulatedChallenge(passengerId: string): { challenge: string; expiresAt: number } {
    const timestamp = Date.now();
    const tokenData = `${passengerId}:${timestamp}:${CONFIG.JWT_SECRET}`;
    const signature = crypto.createHash('sha256').update(tokenData).digest('hex');
    const challenge = `${passengerId}.${timestamp}.${signature.substring(0, 16)}`;
    return {
      challenge,
      expiresAt: timestamp + 5 * 60 * 1000, // 5 min expiry
    };
  }

  static verifySimulatedBiometric(passengerId: string, challenge: string): boolean {
    if (!challenge) return false;
    const parts = challenge.split('.');
    if (parts.length !== 3) return false;

    const [cPassengerId, cTimestampStr, cSig] = parts;
    if (cPassengerId !== passengerId) return false;

    const timestamp = parseInt(cTimestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > 5 * 60 * 1000) {
      return false; // Expired
    }

    const expectedData = `${passengerId}:${timestamp}:${CONFIG.JWT_SECRET}`;
    const expectedSig = crypto.createHash('sha256').update(expectedData).digest('hex').substring(0, 16);

    return cSig === expectedSig;
  }
}
