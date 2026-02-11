import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from '../entities/task.entity';
import { Organization } from '../entities/organization.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditService } from '../audit/audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Organization, AuditLog])],
  controllers: [TasksController],
  providers: [TasksService, AuditService],
})
export class TasksModule {}
