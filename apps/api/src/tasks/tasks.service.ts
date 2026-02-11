import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from '../entities/task.entity';
import { Organization } from '../entities/organization.entity';
import { CreateTaskDto, UpdateTaskDto, UserRole, TaskStatus } from '../../../../libs/data/interfaces';
import { RBACService } from '../../../../libs/auth/rbac.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private auditService: AuditService,
  ) {}

  private async buildOrganizationTree(): Promise<Map<string, string[]>> {
    const organizations = await this.organizationRepository.find();
    const tree = new Map<string, string[]>();

    organizations.forEach(org => {
      if (org.parentId) {
        const children = tree.get(org.parentId) || [];
        children.push(org.id);
        tree.set(org.parentId, children);
      }
    });

    return tree;
  }

  private async getAccessibleOrganizationIds(
    userOrgId: string,
    userRole: UserRole,
  ): Promise<string[]> {
    const orgIds = [userOrgId];

    // Owners and Admins can access child organizations
    if (userRole === UserRole.OWNER || userRole === UserRole.ADMIN) {
      const tree = await this.buildOrganizationTree();
      const children = tree.get(userOrgId) || [];
      orgIds.push(...children);
    }

    return orgIds;
  }

  async create(
    createTaskDto: CreateTaskDto,
    userId: string,
    userOrgId: string,
    userRole: UserRole,
  ): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      userId,
      organizationId: userOrgId,
      status: createTaskDto.status || TaskStatus.TODO,
    });

    const savedTask = await this.taskRepository.save(task);

    await this.auditService.log(
      userId,
      'CREATE',
      'Task',
      savedTask.id,
      { title: savedTask.title },
    );

    return savedTask;
  }

  async findAll(
    userId: string,
    userOrgId: string,
    userRole: UserRole,
  ): Promise<Task[]> {
    const accessibleOrgIds = await this.getAccessibleOrganizationIds(userOrgId, userRole);

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .where('task.organizationId IN (:...orgIds)', { orgIds: accessibleOrgIds });

    // Viewers can only see their own tasks
    if (userRole === UserRole.VIEWER) {
      queryBuilder.andWhere('task.userId = :userId', { userId });
    }

    return queryBuilder
      .orderBy('task.order', 'ASC')
      .addOrderBy('task.createdAt', 'DESC')
      .getMany();
  }

  async findOne(
    id: string,
    userId: string,
    userOrgId: string,
    userRole: UserRole,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user can access this task
    const tree = await this.buildOrganizationTree();
    const canAccess = RBACService.canAccessOrganization(
      userOrgId,
      task.organizationId,
      userRole,
      tree,
    );

    if (!canAccess) {
      throw new ForbiddenException('You do not have access to this task');
    }

    // Viewers can only see their own tasks
    if (userRole === UserRole.VIEWER && task.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
    userOrgId: string,
    userRole: UserRole,
  ): Promise<Task> {
    const task = await this.findOne(id, userId, userOrgId, userRole);

    // Check if user can modify this task
    const canModify = RBACService.canModifyResource(
      userRole,
      userOrgId,
      task.organizationId,
      task.userId,
      userId,
    );

    if (!canModify) {
      throw new ForbiddenException('You do not have permission to modify this task');
    }

    Object.assign(task, updateTaskDto);
    const updatedTask = await this.taskRepository.save(task);

    await this.auditService.log(
      userId,
      'UPDATE',
      'Task',
      task.id,
      { changes: updateTaskDto },
    );

    return updatedTask;
  }

  async remove(
    id: string,
    userId: string,
    userOrgId: string,
    userRole: UserRole,
  ): Promise<void> {
    const task = await this.findOne(id, userId, userOrgId, userRole);

    // Check if user can delete this task
    const canDelete = RBACService.canDeleteResource(
      userRole,
      userOrgId,
      task.organizationId,
      task.userId,
      userId,
    );

    if (!canDelete) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    await this.taskRepository.remove(task);

    await this.auditService.log(
      userId,
      'DELETE',
      'Task',
      id,
      { title: task.title },
    );
  }
}
