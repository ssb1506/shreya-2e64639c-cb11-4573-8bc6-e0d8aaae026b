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
    if (userOrgId === targetOrgId) return true;
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
    if (userRole === UserRole.OWNER && userOrgId === resourceOrgId) return true;
    if (userRole === UserRole.ADMIN && userOrgId === resourceOrgId) return true;
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
    if (userRole === UserRole.OWNER && userOrgId === resourceOrgId) return true;
    if (userRole === UserRole.ADMIN && userOrgId === resourceOrgId) return true;
    if (userRole === UserRole.VIEWER) {
      return resourceUserId === currentUserId && userOrgId === resourceOrgId;
    }
    return false;
  }
}
