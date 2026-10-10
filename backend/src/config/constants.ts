import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'cloudbus-super-secret-jwt-key-academic-2026',
  JWT_EXPIRES_IN: '24h',
  TICKET_SIGN_SECRET: process.env.TICKET_SIGN_SECRET || 'cloudbus-ticket-hmac-sha256-key-secure',
  
  // Biometric / WebAuthn settings
  RP_NAME: 'CloudBus Transport Authority',
  RP_ID: process.env.RP_ID || 'localhost',
  ORIGIN: process.env.ORIGIN || 'http://localhost:5173',

  // AWS Configuration
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  DYNAMODB_TABLE_PREFIX: process.env.DYNAMODB_TABLE_PREFIX || 'CloudBus_',
  USE_DYNAMODB: process.env.USE_DYNAMODB === 'true',

  // Default Business Rules
  DEFAULT_CREDIT_LIMIT: 200, // ₹200 default maximum outstanding travel credit
  MIN_ADD_MONEY: 10,
  MAX_ADD_MONEY: 5000,
  MIN_WITHDRAWAL: 50,
  MAX_WITHDRAWAL: 2000,
  
  // Default Base Fare Configuration
  DEFAULT_FARE_RULES: {
    ruleId: 'DEFAULT_RULES',
    baseFare: 10,
    perKmRate: 2.5,
    minimumFare: 10,
    maximumFare: 80,
    currency: 'INR',
    updatedAt: new Date().toISOString(),
  }
};
