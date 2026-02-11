import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details?: any,
  ): Promise<void> {
    const log = this.auditLogRepository.create({
      userId,
      action,
      resourceType,
      resourceId,
      details: details ? JSON.stringify(details) : null,
    });

    await this.auditLogRepository.save(log);

    // Also log to console/file for immediate visibility
    console.log(`[AUDIT] ${new Date().toISOString()} - User ${userId} - ${action} ${resourceType} ${resourceId}`);
  }

  async getLogs(limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  async getLogsByUser(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
