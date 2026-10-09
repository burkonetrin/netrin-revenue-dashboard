import type { Permission } from "../types/permission.types";

/**
 * Indica se a permissão permite abrir o drawer de clientes vinculados.
 *
 * @param permission - Permissão selecionada na árvore RBAC
 */
export function canViewRoleLinkedClients(permission: Permission): boolean {
  return String(permission.id).includes(":");
}

/**
 * Extrai roleId e segmento da permissão para consulta de clientes vinculados.
 *
 * @param permission - Permissão com ID composto (`roleId:segmento`)
 * @returns Parâmetros para a API de clientes vinculados
 */
export function getRoleLinkedClientsParams(permission: Permission) {
  const [roleId] = String(permission.id).split(":");
  return { roleId, segment: permission.internalName };
}
