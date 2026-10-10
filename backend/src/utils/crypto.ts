import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { CONFIG } from '../config/constants.js';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const signTicketData = (payload: Record<string, any>): string => {
  const stringified = JSON.stringify(payload);
  return crypto
    .createHmac('sha256', CONFIG.TICKET_SIGN_SECRET)
    .update(stringified)
    .digest('hex');
};

export const verifyTicketSignature = (payload: Record<string, any>, signature: string): boolean => {
  const expectedSignature = signTicketData(payload);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

export const generateId = (prefix: string = ''): string => {
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  return prefix ? `${prefix}-${rand}` : rand;
};
