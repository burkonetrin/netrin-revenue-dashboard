import type { RBACRole, PermissionWithChildren, PermissionType, RBACPermissionGroup } from "../types/permission.types";

/**
 * Função recursiva para mapear RBACPermissionGroup para PermissionWithChildren
 */
function mapGroupToChildren(
  groupKey: string,
  group: RBACPermissionGroup,
  _parentId: string | number,
  type: PermissionType,
  roleId: string,
  path: string
): PermissionWithChildren {
  const currentId = `${path}:${groupKey}`;
  const children: PermissionWithChildren[] = [];

  if (group.items_active && Array.isArray(group.items_active)) {
    group.items_active.forEach((itemMap, index) => {
      Object.entries(itemMap).forEach(([subKey, subGroup]) => {
        children.push(
          mapGroupToChildren(
            subKey,
            subGroup,
            currentId,
            type,
            roleId,
            `${currentId}:${index}`
          )
        );
      });
    });
  }

  return {
    id: currentId,
    name: group.name,
    internalName: groupKey,
    description: group.description,
    type,
    isActive: group.is_active,
    hasChildren: children.length > 0,
    hasLinkedUsers: false,
    children: children.length > 0 ? children : undefined,
  };
}

/**
 * Mapeia a estrutura de RBACRole da API para a estrutura hierárquica recursiva.
 * 
 * Estrutura do ID Composto: roleId:key1:idx1:key2:idx2...
 */
export function mapRBACRolesToPermissions(roles: RBACRole[], type: PermissionType): PermissionWithChildren[] {
  return roles.map((role) => {
    const children: PermissionWithChildren[] = [];

    if (role.permissions) {
      Object.entries(role.permissions).forEach(([groupKey, group]) => {
        children.push(
          mapGroupToChildren(
            groupKey,
            group,
            role.id,
            type,
            role.id,
            role.id
          )
        );
      });
    }

    return {
      id: role.id,
      name: role.name,
      internalName: role.internalName,
      description: role.description,
      type,
      isActive: role.isActive,
      productId: role.productId,
      isArchived: role.isArchived,
      createdAt: role.createdAt,
      hasChildren: children.length > 0,
      hasLinkedUsers: role.users && role.users.length > 0,
      children: children,
    };
  });
}
