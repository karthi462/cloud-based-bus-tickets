import { Permission, UserRole } from '../models/types.js';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'VIEW_PASSENGERS',
    'MANAGE_PASSENGERS',
    'MANAGE_CONDUCTORS',
    'MANAGE_BUSES',
    'MANAGE_ROUTES',
    'GENERATE_TICKETS',
    'VIEW_WALLET_TRANSACTIONS',
    'APPROVE_WITHDRAWALS',
    'MANAGE_CREDIT_RULES',
    'VIEW_REPORTS',
    'VIEW_AUDIT_LOGS',
    'VALIDATE_TICKETS',
  ],
  CONDUCTOR: [
    'GENERATE_TICKETS',
    'VALIDATE_TICKETS',
  ],
  PASSENGER: [],
};

export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  const allowed = ROLE_PERMISSIONS[userRole] || [];
  return allowed.includes(permission);
};
