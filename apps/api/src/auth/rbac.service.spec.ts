import { RBACService } from '../../../../libs/auth/rbac.service';
import { UserRole } from '../../../../libs/data/interfaces';

describe('RBACService', () => {
  describe('hasRole', () => {
    it('should allow OWNER to access all roles', () => {
      expect(RBACService.hasRole(UserRole.OWNER, [UserRole.OWNER])).toBe(true);
      expect(RBACService.hasRole(UserRole.OWNER, [UserRole.ADMIN])).toBe(true);
      expect(RBACService.hasRole(UserRole.OWNER, [UserRole.VIEWER])).toBe(true);
    });

    it('should allow ADMIN to access ADMIN and VIEWER', () => {
      expect(RBACService.hasRole(UserRole.ADMIN, [UserRole.ADMIN])).toBe(true);
      expect(RBACService.hasRole(UserRole.ADMIN, [UserRole.VIEWER])).toBe(true);
      expect(RBACService.hasRole(UserRole.ADMIN, [UserRole.OWNER])).toBe(false);
    });

    it('should allow VIEWER to access only VIEWER', () => {
      expect(RBACService.hasRole(UserRole.VIEWER, [UserRole.VIEWER])).toBe(true);
      expect(RBACService.hasRole(UserRole.VIEWER, [UserRole.ADMIN])).toBe(false);
      expect(RBACService.hasRole(UserRole.VIEWER, [UserRole.OWNER])).toBe(false);
    });
  });

  describe('canModifyResource', () => {
    it('should allow OWNER to modify resources in their organization', () => {
      expect(
        RBACService.canModifyResource(
          UserRole.OWNER,
          'org1',
          'org1',
          'user1',
          'user2'
        )
      ).toBe(true);
    });

    it('should allow ADMIN to modify resources in their organization', () => {
      expect(
        RBACService.canModifyResource(
          UserRole.ADMIN,
          'org1',
          'org1',
          'user1',
          'user2'
        )
      ).toBe(true);
    });

    it('should allow VIEWER to modify only their own resources', () => {
      expect(
        RBACService.canModifyResource(
          UserRole.VIEWER,
          'org1',
          'org1',
          'user1',
          'user1'
        )
      ).toBe(true);

      expect(
        RBACService.canModifyResource(
          UserRole.VIEWER,
          'org1',
          'org1',
          'user1',
          'user2'
        )
      ).toBe(false);
    });

    it('should not allow modification across organizations', () => {
      expect(
        RBACService.canModifyResource(
          UserRole.ADMIN,
          'org1',
          'org2',
          'user1',
          'user1'
        )
      ).toBe(false);
    });
  });

  describe('canDeleteResource', () => {
    it('should allow OWNER to delete resources in their organization', () => {
      expect(
        RBACService.canDeleteResource(
          UserRole.OWNER,
          'org1',
          'org1',
          'user1',
          'user2'
        )
      ).toBe(true);
    });

    it('should allow VIEWER to delete only their own resources', () => {
      expect(
        RBACService.canDeleteResource(
          UserRole.VIEWER,
          'org1',
          'org1',
          'user1',
          'user1'
        )
      ).toBe(true);

      expect(
        RBACService.canDeleteResource(
          UserRole.VIEWER,
          'org1',
          'org1',
          'user1',
          'user2'
        )
      ).toBe(false);
    });
  });
});
