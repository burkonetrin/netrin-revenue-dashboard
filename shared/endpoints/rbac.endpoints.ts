import { getBaseURL } from "@/shared/utils/env";

const BASE_URL = getBaseURL();

/**
 * Endpoints da API de papéis (roles) e permissões RBAC.
 */
export const RBAC_ENDPOINTS = {
  /**
   * GET /v1/rbac/roles
   * Lista os papéis de RBAC com paginação, filtros e busca
   * Query params: page, page-size, sort-by, sort-direction, search, product-id
   */
  LIST: `${BASE_URL}v1/rbac/roles`,

  /**
   * GET /v1/rbac/roles/{role_id}
   * Retorna um papel de RBAC pelo ID
   */
  GET_BY_ID: (roleId: string) => `${BASE_URL}v1/rbac/roles/${roleId}`,

  /**
   * POST /v1/rbac/roles
   * Cria um novo papel de RBAC
   */
  CREATE: `${BASE_URL}v1/rbac/roles`,

  /**
   * PUT /v1/rbac/roles/{role_id}
   * Atualiza um papel de RBAC pelo ID
   */
  UPDATE: (roleId: string) => `${BASE_URL}v1/rbac/roles/${roleId}`,

  /**
   * DELETE /v1/rbac/roles/{role_id}
   * Deleta um papel de RBAC pelo ID
   */
  DELETE: (roleId: string) => `${BASE_URL}v1/rbac/roles/${roleId}`,

  /**
   * PATCH /v1/rbac/roles/{role_id}/active
   * Altera o status de ativação de um papel de RBAC
   */
  UPDATE_STATUS: (roleId: string) => `${BASE_URL}v1/rbac/roles/${roleId}/active`,
 
  /**
   * PUT /v1/rbac/roles/{role_id}/permissions
   * Atualiza a árvore de permissões de uma role
   */
  UPDATE_PERMISSIONS: (roleId: string) =>
    `${BASE_URL}v1/rbac/roles/${roleId}/permissions`,
 
  /**
   * PATCH /v1/rbac/roles/{role_id}/permissions/{permission_path}/active
   * Altera o status de ativação de uma permissão
   */
  UPDATE_PERMISSION_STATUS: (roleId: string, permissionPath: string) =>
    `${BASE_URL}v1/rbac/roles/${roleId}/permissions/${permissionPath}/active`,
 
  /**
   * DELETE /v1/rbac/roles/{role_id}/permissions/{permission_path}
   * Remove uma permissão da role
   */
  REMOVE_PERMISSION: (roleId: string, permissionPath: string) =>
    `${BASE_URL}v1/rbac/roles/${roleId}/permissions/${permissionPath}`,
 

  /**
   * POST /v1/rbac/roles/{role_id}/users
   * Atribui um usuário a um papel
   */
  ASSIGN_USER: (roleId: string) => `${BASE_URL}v1/rbac/roles/${roleId}/users`,

  /**
   * DELETE /v1/rbac/roles/{role_id}/users/{user_id}
   * Remove um usuário de um papel
   */
  REMOVE_USER: (roleId: string, userId: string) =>
    `${BASE_URL}v1/rbac/roles/${roleId}/users/${userId}`,

  /**
   * GET /v1/rbac/roles/{role_id}/clients/{segment}
   * Lista clientes com usuários vinculados a uma role por segmento
   */
  LIST_CLIENTS_BY_SEGMENT: (roleId: string, segment: string) =>
    `${BASE_URL}v1/rbac/roles/${roleId}/clients/${segment}`,
} as const;

export default RBAC_ENDPOINTS;
