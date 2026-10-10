import { getRepository } from '../repositories/index.js';
import { AuditLog, UserRole } from '../models/types.js';
import { generateId } from '../utils/crypto.js';

export class AuditService {
  static async log(
    action: string,
    targetResource: string,
    details: Record<string, any>,
    actor?: { userId?: string; role?: UserRole; ipAddress?: string },
    status: 'SUCCESS' | 'FAILURE' = 'SUCCESS'
  ): Promise<AuditLog> {
    const repo = getRepository();
    const log: AuditLog = {
      logId: generateId('LOG'),
      timestamp: new Date().toISOString(),
      actorUserId: actor?.userId,
      actorRole: actor?.role,
      action,
      targetResource,
      details,
      ipAddress: actor?.ipAddress,
      status,
    };
    return repo.createAuditLog(log);
  }

  static async getRecentLogs(limit: number = 100): Promise<AuditLog[]> {
    const repo = getRepository();
    return repo.listAuditLogs(limit);
  }
}
