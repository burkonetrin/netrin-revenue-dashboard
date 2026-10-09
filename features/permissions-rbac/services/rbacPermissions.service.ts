import api from "@/shared/lib/axios";
import { RBAC_ENDPOINTS } from "@/shared/endpoints/rbac.endpoints";
import type {
  CreateRBACRoleData,
  RBACRole,
  RBACRolesResponse,
  UpdateRBACRoleData,
  UpdateRBACRolePermissionsData,
  PermissionType,
  ListRoleLinkedClientsParams,
  PaginatedRoleLinkedClientsResponse,
} from "../types/permission.types";

/** Mapeamento entre tipo de permissão e ID do produto na API RBAC. */
export const PRODUCT_ID_MAPPING: Record<PermissionType, string> = {
  SafePartner: "0195694a-939a-7c9c-b169-2f22b8264770",
  Nucleus: "0195694a-939a-7c9c-b169-2f22b8264779",
};

/**
 * GET /v1/rbac/roles
 * Listar papéis de RBAC
 */
export async function getRBACRoles(
  page = 1,
  pageSize = 100,
  type?: PermissionType,
): Promise<RBACRolesResponse> {
  const params: Record<string, string | number> = {
    page,
    "page-size": pageSize,
    "sort-by": "name",
    "sort-direction": "asc",
  };

  // Se o tipo for passado, podemos tentar filtrar por productId na API
  if (type && PRODUCT_ID_MAPPING[type]) {
    params.productId = PRODUCT_ID_MAPPING[type];
  }

  const response = await api.get<RBACRolesResponse>(RBAC_ENDPOINTS.LIST, {
    params,
  });

  // Se a API não suportar o filtro por productId no query param, filtramos no frontend
  if (type && response.data.data) {
    const targetProductId = PRODUCT_ID_MAPPING[type];
    const filteredData = response.data.data.filter(
      (role) => role.productId === targetProductId
    );

    // Se o filtro reduziu o número de itens, retornamos a lista filtrada
    // (Nota: isso pode quebrar a paginação se feita puramente no frontend, 
    // mas se a API já filtrou, filteredData será igual a data)
    return {
      ...response.data,
      data: filteredData.length > 0 || response.data.data.length === 0 
        ? filteredData 
        : response.data.data,
    };
  }

  return response.data;
}

/**
 * GET /v1/rbac/roles/{role_id}
 * Obter papel de RBAC pelo ID
 */
export async function getRBACRoleById(roleId: string): Promise<RBACRole> {
  const response = await api.get<RBACRole>(RBAC_ENDPOINTS.GET_BY_ID(roleId));
  return response.data;
}

/**
 * POST /v1/rbac/roles
 * Criar novo papel de RBAC
 */
export async function createRBACRole(
  data: CreateRBACRoleData
): Promise<RBACRole> {
  const response = await api.post<RBACRole>(RBAC_ENDPOINTS.CREATE, data);
  return response.data;
}

/**
 * PUT /v1/rbac/roles/{role_id}
 * Atualizar papel de RBAC
 */
export async function updateRBACRole(
  roleId: string,
  data: UpdateRBACRoleData
): Promise<RBACRole> {
  const response = await api.put<RBACRole>(RBAC_ENDPOINTS.UPDATE(roleId), data);
  return response.data;
}

/**
 * PUT /v1/rbac/roles/{role_id}/permissions
 * Atualizar a árvore de permissões
 */
export async function updateRBACRolePermissions(
  roleId: string,
  data: UpdateRBACRolePermissionsData
): Promise<RBACRole> {
  const response = await api.put<RBACRole>(
    RBAC_ENDPOINTS.UPDATE_PERMISSIONS(roleId),
    data
  );
  return response.data;
}

/**
 * DELETE /v1/rbac/roles/{role_id}
 * Deletar papel de RBAC
 */
export async function deleteRBACRole(roleId: string): Promise<void> {
  await api.delete(RBAC_ENDPOINTS.DELETE(roleId));
}

/**
 * PATCH /v1/rbac/roles/{role_id}/active
 * Alternar status de ativação do papel de RBAC
 */
export async function updateRBACRoleStatus(
  roleId: string,
  isActive: boolean
): Promise<RBACRole> {
  const response = await api.patch<RBACRole>(
    RBAC_ENDPOINTS.UPDATE_STATUS(roleId),
    { isActive }
  );
  return response.data;
}

/**
 * PATCH /v1/rbac/roles/{role_id}/permissions/{path}/active
 * Atualizar status de uma permissão específica
 */
export async function updatePermissionStatus(
  roleId: string,
  permissionPath: string,
  isActive: boolean
): Promise<void> {
  await api.patch(
    RBAC_ENDPOINTS.UPDATE_PERMISSION_STATUS(roleId, permissionPath),
    { isActive }
  );
}

/**
 * DELETE /v1/rbac/roles/{role_id}/permissions/{path}
 * Remover uma permissão específica da role
 */
export async function removePermissionFromRole(
  roleId: string,
  permissionPath: string
): Promise<void> {
  await api.delete(RBAC_ENDPOINTS.REMOVE_PERMISSION(roleId, permissionPath));
}

function toRoleLinkedClientsApiParams(params: ListRoleLinkedClientsParams) {
  const { pageSize, sortBy, sortDirection, ...rest } = params;
  return {
    ...rest,
    "page-size": pageSize,
    "sort-by": sortBy,
    "sort-direction": sortDirection,
  };
}

/**
 * GET /v1/rbac/roles/{role_id}/clients/{segment}
 * Lista clientes com usuários vinculados a uma role por segmento
 */
export async function getRoleLinkedClients(
  roleId: string,
  segment: string,
  params?: ListRoleLinkedClientsParams,
): Promise<PaginatedRoleLinkedClientsResponse> {
  const apiParams = toRoleLinkedClientsApiParams({
    sortBy: "name",
    sortDirection: "asc",
    pageSize: 100,
    ...params,
  });
  const response = await api.get<PaginatedRoleLinkedClientsResponse>(
    RBAC_ENDPOINTS.LIST_CLIENTS_BY_SEGMENT(roleId, segment),
    { params: apiParams },
  );
  return response.data;
}
