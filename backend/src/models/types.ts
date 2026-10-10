// Core Type Definitions for CloudBus System

export type UserRole = 'ADMIN' | 'CONDUCTOR' | 'PASSENGER';

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export type PaymentMethod = 'WALLET' | 'TRAVEL_CREDIT';

export type TicketStatus = 'ISSUED' | 'VALIDATED' | 'CANCELLED' | 'EXPIRED';

export type TransactionType = 'ADD_MONEY' | 'FARE_DEDUCTION' | 'CREDIT_REPAYMENT' | 'WITHDRAWAL';

export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type CreditStatus = 'ACTIVE' | 'OVERDUE' | 'BLOCKED';

export type Permission =
  | 'VIEW_PASSENGERS'
  | 'MANAGE_PASSENGERS'
  | 'MANAGE_CONDUCTORS'
  | 'MANAGE_BUSES'
  | 'MANAGE_ROUTES'
  | 'GENERATE_TICKETS'
  | 'VIEW_WALLET_TRANSACTIONS'
  | 'APPROVE_WITHDRAWALS'
  | 'MANAGE_CREDIT_RULES'
  | 'VIEW_REPORTS'
  | 'VIEW_AUDIT_LOGS'
  | 'VALIDATE_TICKETS';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PassengerProfile {
  userId: string;
  passengerId: string; // e.g. CB-PASS-1001
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  biometricEnrolled: boolean;
  biometricCredentialId?: string;
  biometricType?: 'WEBAUTHN' | 'SIMULATED';
  termsConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConductorProfile {
  userId: string;
  employeeId: string; // e.g. CB-EMP-2001
  fullName: string;
  mobileNumber: string;
  assignedBusId?: string;
  assignedRouteId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Driver {
  driverId: string;
  fullName: string;
  licenseNumber: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Bus {
  busId: string;
  busNumber: string; // e.g. "KA-01-F-4022" or "BUS-101"
  capacity: number;
  registrationNumber: string;
  status: 'ACTIVE' | 'MAINTENANCE';
  defaultRouteId?: string;
  createdAt: string;
}

export interface Stop {
  stopId: string;
  stopName: string;
  code: string;
  latitude?: number;
  longitude?: number;
}

export interface RouteStop {
  routeId: string;
  stopId: string;
  stopName: string;
  sequenceIndex: number;
  distanceFromStartKm: number;
  fareFromStart: number;
}

export interface Route {
  routeId: string;
  routeNumber: string; // e.g. "R-101"
  routeName: string; // e.g. "Majestic to Electronic City"
  startStopId: string;
  endStopId: string;
  totalDistanceKm: number;
  status: 'ACTIVE' | 'INACTIVE';
  stops: RouteStop[];
  createdAt: string;
}

export interface FareRules {
  ruleId: string;
  baseFare: number; // e.g. ₹10
  perKmRate: number; // e.g. ₹2.5 / km
  minimumFare: number; // e.g. ₹10
  maximumFare: number; // e.g. ₹80
  currency: string; // "INR"
  updatedAt: string;
}

export interface BiometricCredential {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports?: string[];
  deviceType?: string;
  createdAt: string;
}

export interface Wallet {
  walletId: string;
  userId: string;
  passengerId: string;
  balance: number; // Always >= 0
  currency: string;
  lastUpdated: string;
}

export interface WalletTransaction {
  transactionId: string;
  walletId: string;
  userId: string;
  amount: number;
  type: TransactionType;
  referenceId: string;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  description: string;
  idempotencyKey?: string;
  createdAt: string;
}

export interface CreditAccount {
  creditAccountId: string;
  userId: string;
  passengerId: string;
  maxCreditLimit: number; // default e.g. ₹200
  outstandingCredit: number; // current credit owed
  availableCredit: number; // maxCreditLimit - outstandingCredit
  status: CreditStatus;
  lastRepaymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  ticketId: string;
  qrCodeData: string;
  passengerId: string;
  passengerName: string;
  conductorEmployeeId: string;
  conductorName: string;
  driverId: string;
  driverName: string;
  busNumber: string;
  routeId: string;
  routeName: string;
  boardingStopId: string;
  boardingStopName: string;
  destinationStopId: string;
  destinationStopName: string;
  fare: number;
  paymentMethod: PaymentMethod;
  status: TicketStatus;
  issuedAt: string;
  validatedAt?: string;
  validatedBy?: string;
  signature: string; // verifiable HMAC or cryptographic digest
}

export interface WithdrawalRequest {
  withdrawalId: string;
  userId: string;
  passengerId: string;
  amount: number;
  status: WithdrawalStatus;
  bankDetails?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reason?: string;
}

export interface Notification {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  logId: string;
  timestamp: string;
  actorUserId?: string;
  actorRole?: string;
  action: string;
  targetResource: string;
  details: Record<string, any>;
  ipAddress?: string;
  status: 'SUCCESS' | 'FAILURE';
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}
