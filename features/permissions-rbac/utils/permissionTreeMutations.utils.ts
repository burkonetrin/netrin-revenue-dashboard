import type {
  RBACPermissionGroup,
  RBACPermissions,
} from "../types/permission.types";

/** Dados do formulário de criação/edição de permissão RBAC. */
export interface PermissionFormData {
  name: string;
  internalName: string;
  description: string;
}

/** Navega na árvore RBAC até o grupo no caminho informado. */
export function getPermissionGroup(
  root: RBACPermissions,
  path: string[],
): RBACPermissionGroup {
  let currentMap: RBACPermissions = root;
  let group: RBACPermissionGroup = root[path[1]];

  for (let i = 1; i < path.length; i += 2) {
    const key = path[i];
    group = currentMap[key];
    if (i + 1 < path.length) {
      const idx = parseInt(path[i + 1], 10);
      currentMap = group.items_active?.[idx] ?? {};
    }
  }

  return group;
}

function updateExistingPermissionAtPath(
  obj: RBACPermissions,
  pathParts: string[],
  newData: PermissionFormData,
) {
  if (pathParts.length === 2) {
    const [, targetKey] = pathParts;
    const groupData = obj[targetKey];
    if (!groupData) return;
    obj[targetKey] = {
      ...groupData,
      name: newData.name,
      description: newData.description,
    };
    return;
  }

  const parentPath = pathParts.slice(0, -2);
  const parentGroup = getPermissionGroup(obj, parentPath);
  const targetIdx = parseInt(pathParts[pathParts.length - 2], 10);
  const subKey = pathParts[pathParts.length - 1];
  const itemMap = parentGroup.items_active?.[targetIdx];
  const groupData = itemMap?.[subKey];
  if (!itemMap || !groupData) return;

  itemMap[subKey] = {
    ...groupData,
    name: newData.name,
    description: newData.description,
  };
}

function createPermissionAtPath(
  obj: RBACPermissions,
  pathParts: string[],
  newData: PermissionFormData,
) {
  if (pathParts.length === 1) {
    obj[newData.internalName] = {
      name: newData.name,
      is_active: true,
      description: newData.description,
      items_active: [],
    };
    return;
  }

  const targetGroup = getPermissionGroup(obj, pathParts);
  if (!targetGroup.items_active) targetGroup.items_active = [];
  targetGroup.items_active.push({
    [newData.internalName]: {
      name: newData.name,
      is_active: true,
      description: newData.description,
      items_active: [],
    },
  });
}

/** Atualiza ou cria permissão no caminho da árvore RBAC. */
export function updatePermissionAtPath(
  obj: RBACPermissions,
  pathParts: string[],
  newData: PermissionFormData,
  isEditing: boolean,
) {
  if (isEditing) {
    updateExistingPermissionAtPath(obj, pathParts, newData);
    return;
  }
  createPermissionAtPath(obj, pathParts, newData);
}

/** Remove permissão do caminho na árvore RBAC. */
export function removePermissionFromPath(
  obj: RBACPermissions,
  pathParts: string[],
) {
  if (pathParts.length === 2) {
    const [, targetKey] = pathParts;
    delete obj[targetKey];
    return;
  }

  const parentPath = pathParts.slice(0, -2);
  const parentGroup = getPermissionGroup(obj, parentPath);
  const targetIdx = parseInt(pathParts[pathParts.length - 2], 10);
  if (parentGroup?.items_active) {
    parentGroup.items_active.splice(targetIdx, 1);
  }
}
