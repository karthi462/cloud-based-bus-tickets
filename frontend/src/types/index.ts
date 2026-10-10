export type UserRole = 'ADMIN' | 'CONDUCTOR' | 'PASSENGER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  passengerId?: string;
  aadhaarNumber?: string;
  aadhaarVerified?: boolean;
  gender?: string;
  city?: string;
  fingerprintTemplateId?: string;
  employeeId?: string;
  assignedBusId?: string;
  assignedRouteId?: string;
  biometricEnrolled?: boolean;
}

export interface PassengerProfile {
  userId: string;
  passengerId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  aadhaarNumber?: string;
  aadhaarVerified?: boolean;
  gender?: string;
  city?: string;
  fingerprintTemplateId?: string;
  biometricEnrolled: boolean;
  biometricType?: 'WEBAUTHN' | 'SIMULATED';
  termsConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TouchIdentifyPassenger {
  passengerId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  aadhaarNumber?: string;
  aadhaarVerified?: boolean;
  gender?: string;
  city?: string;
  fingerprintTemplateId?: string;
  walletBalance: number;
  outstandingCredit: number;
  availableCredit: number;
  creditLimit: number;
}

export interface Wallet {
  walletId: string;
  userId: string;
  passengerId: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface CreditAccount {
  creditAccountId: string;
  userId: string;
  passengerId: string;
  maxCreditLimit: number;
  outstandingCredit: number;
  availableCredit: number;
  status: 'ACTIVE' | 'OVERDUE' | 'BLOCKED';
  lastRepaymentDate?: string;
}

export interface WalletTransaction {
  transactionId: string;
  walletId: string;
  userId: string;
  amount: number;
  type: 'ADD_MONEY' | 'FARE_DEDUCTION' | 'CREDIT_REPAYMENT' | 'WITHDRAWAL';
  referenceId: string;
  balanceBefore: number;
  balanceAfter: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  description: string;
  createdAt: string;
}

export interface Ticket {
  ticketId: string;
  qrCodeData: string;
  qrCodeDataUrl?: string;
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
  paymentMethod: 'WALLET' | 'TRAVEL_CREDIT';
  status: 'ISSUED' | 'VALIDATED' | 'CANCELLED' | 'EXPIRED';
  issuedAt: string;
  validatedAt?: string;
  validatedBy?: string;
  signature: string;
}

export interface Driver {
  driverId: string;
  fullName: string;
  licenseNumber: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Bus {
  busId: string;
  busNumber: string;
  capacity: number;
  registrationNumber: string;
  status: 'ACTIVE' | 'MAINTENANCE';
  defaultRouteId?: string;
}

export interface Stop {
  stopId: string;
  stopName: string;
  code: string;
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
  routeNumber: string;
  routeName: string;
  startStopId: string;
  endStopId: string;
  totalDistanceKm: number;
  status: 'ACTIVE' | 'INACTIVE';
  stops: RouteStop[];
}

export interface WithdrawalRequest {
  withdrawalId: string;
  userId: string;
  passengerId: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  bankDetails?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reason?: string;
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
