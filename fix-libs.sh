#!/bin/bash

# Quick Fix Script for Missing libs folder
# Run this from the task-management root directory

echo "Creating libs directory structure..."

# Create directories
mkdir -p libs/data
mkdir -p libs/auth

# Create libs/data/interfaces.ts
cat > libs/data/interfaces.ts << 'EOF'
export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum TaskCategory {
  WORK = 'WORK',
  PERSONAL = 'PERSONAL',
  URGENT = 'URGENT',
  OTHER = 'OTHER'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  parentId?: string;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  category: TaskCategory;
  userId: string;
  organizationId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: Date;
  details?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: Omit<User, 'password'>;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status?: TaskStatus;
  category: TaskCategory;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
  order?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
EOF

# Create libs/auth/decorators.ts
cat > libs/auth/decorators.ts << 'EOF'
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../data/interfaces';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
EOF

# Create libs/auth/rbac.service.ts
cat > libs/auth/rbac.service.ts << 'EOF'
import { UserRole } from '../data/interfaces';

export class RBACService {
  private static roleHierarchy: Record<UserRole, number> = {
    [UserRole.OWNER]: 3,
    [UserRole.ADMIN]: 2,
    [UserRole.VIEWER]: 1,
  };

  static hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.some(
      (required) => this.roleHierarchy[userRole] >= this.roleHierarchy[required]
    );
  }

  static canAccessOrganization(
    userOrgId: string,
    targetOrgId: string,
    userRole: UserRole,
    organizationTree: Map<string, string[]>
  ): boolean {
    if (userOrgId === targetOrgId) {
      return true;
    }

    if (userRole === UserRole.OWNER || userRole === UserRole.ADMIN) {
      const children = organizationTree.get(userOrgId) || [];
      return children.includes(targetOrgId);
    }

    return false;
  }

  static canModifyResource(
    userRole: UserRole,
    userOrgId: string,
    resourceOrgId: string,
    resourceUserId?: string,
    currentUserId?: string
  ): boolean {
    if (userRole === UserRole.OWNER && userOrgId === resourceOrgId) {
      return true;
    }

    if (userRole === UserRole.ADMIN && userOrgId === resourceOrgId) {
      return true;
    }

    if (userRole === UserRole.VIEWER) {
      return resourceUserId === currentUserId && userOrgId === resourceOrgId;
    }

    return false;
  }

  static canDeleteResource(
    userRole: UserRole,
    userOrgId: string,
    resourceOrgId: string,
    resourceUserId?: string,
    currentUserId?: string
  ): boolean {
    if (userRole === UserRole.OWNER && userOrgId === resourceOrgId) {
      return true;
    }

    if (userRole === UserRole.ADMIN && userOrgId === resourceOrgId) {
      return true;
    }

    if (userRole === UserRole.VIEWER) {
      return resourceUserId === currentUserId && userOrgId === resourceOrgId;
    }

    return false;
  }
}
EOF

echo "✅ libs folder created successfully!"
echo ""
echo "Now run these commands:"
echo "  cd apps/api"
echo "  npm run build"
echo "  mkdir -p data && npx ts-node src/seed.ts"
echo "  npm run start:dev"
EOF

chmod +x fix-libs.sh
