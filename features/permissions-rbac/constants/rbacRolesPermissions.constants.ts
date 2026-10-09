/**
 * Chaves RBAC do módulo Roles (produto Nucleus) — Wave 2.
 * Match exato com `roles.json` / `can()` / `PermissionGuard`.
 */
export const RBAC_ROLES_PERMISSIONS = {
  access: "rbacRoles",
  createRole: "rbacRoles.createRole",
  createChildRole: "rbacRoles.createChildRole",
  updateRole: "rbacRoles.updateRole",
  deleteRole: "rbacRoles.deleteRole",
  toggleRole: "rbacRoles.toggleRole",
} as const;

export type RbacRolesPermission =
  (typeof RBAC_ROLES_PERMISSIONS)[keyof typeof RBAC_ROLES_PERMISSIONS];

/** Lista congelada para auditoria / testes. */
export const RBAC_ROLES_PERMISSION_KEYS: readonly RbacRolesPermission[] =
  Object.values(RBAC_ROLES_PERMISSIONS);
