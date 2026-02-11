import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../../../../libs/auth/decorators';
import { UserRole } from '../../../../libs/data/interfaces';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async getAuditLogs(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 100;
    return this.auditService.getLogs(limitNumber);
  }
}
