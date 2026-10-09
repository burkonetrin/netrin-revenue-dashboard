import { getBaseURL } from "@/shared/utils/env";

const BASE_URL = getBaseURL();

/**
 * Endpoints da API de grupos RBAC e hierarquia entre grupos.
 */
export const RBAC_GROUPS_ENDPOINTS = {
  /**
   * GET /v1/rbac/groups
   * Lista os grupos de RBAC com paginação, filtros e busca
   * Query params: page, page-size, sort-by, sort-direction, search, is_active, product-id
   */
  LIST: `${BASE_URL}v1/rbac/groups`,

  /**
   * POST /v1/rbac/groups
   * Cria um novo grupo de RBAC
   */
  CREATE: `${BASE_URL}v1/rbac/groups`,

  /**
   * GET /v1/rbac/groups/{group_id}
   * Retorna um grupo de RBAC pelo ID
   */
  GET_BY_ID: (groupId: string) => `${BASE_URL}v1/rbac/groups/${groupId}`,

  /**
   * PUT /v1/rbac/groups/{group_id}
   * Atualiza um grupo de RBAC pelo ID
   */
  UPDATE: (groupId: string) => `${BASE_URL}v1/rbac/groups/${groupId}`,

  /**
   * DELETE /v1/rbac/groups/{group_id}
   * Arquiva um grupo de RBAC pelo ID
   */
  DELETE: (groupId: string) => `${BASE_URL}v1/rbac/groups/${groupId}`,

  /**
   * PATCH /v1/rbac/groups/{group_id}/active
   * Altera o status de ativação de um grupo de RBAC
   */
  PATCH_ACTIVE: (groupId: string) =>
    `${BASE_URL}v1/rbac/groups/${groupId}/active`,

  /**
   * POST /v1/rbac/groups/{group_id}/roles
   * Atribui um papel a um grupo
   */
  ASSIGN_ROLE: (groupId: string) =>
    `${BASE_URL}v1/rbac/groups/${groupId}/roles`,

  /**
   * DELETE /v1/rbac/groups/{group_id}/roles/{role_id}
   * Remove um papel de um grupo
   */
  REMOVE_ROLE: (groupId: string, roleId: string) =>
    `${BASE_URL}v1/rbac/groups/${groupId}/roles/${roleId}`,

  /**
   * POST /v1/rbac/groups/{group_id}/users
   * Atribui um usuário a um grupo
   */
  ASSIGN_USER: (groupId: string) =>
    `${BASE_URL}v1/rbac/groups/${groupId}/users`,

   /**
   * DELETE /v1/rbac/groups/{group_id}/users/{user_id}
   * Remove um usuário de um grupo
   */
  REMOVE_USER: (groupId: string, userId: string) =>
    `${BASE_URL}v1/rbac/groups/${groupId}/users/${userId}`,

  /**
   * PUT /v1/rbac/groups/{group_id}/roles/{role_id}/permissions
   * Atualiza as permissões de uma role vinculada ao grupo
   */
  UPDATE_ROLE_PERMISSIONS: (groupId: string, roleId: string) =>
    `${BASE_URL}v1/rbac/groups/${groupId}/roles/${roleId}/permissions`,

  /**
   * GET /v1/rbac/groups/{group_id}/children
   * Lista grupos filhos de um grupo de RBAC
   */
  LIST_CHILDREN: (groupId: string) =>
    `${BASE_URL}v1/rbac/groups/${groupId}/children`,

  /**
   * POST /v1/rbac/groups/{group_id}/children
   * Adiciona um grupo filho a um grupo de RBAC
   */
  ADD_CHILD: (groupId: string) =>
    `${BASE_URL}v1/rbac/groups/${groupId}/children`,

  /**
   * DELETE /v1/rbac/groups/{group_id}/children/{child_group_id}
   * Remove um grupo filho de um grupo de RBAC
   */
  REMOVE_CHILD: (groupId: string, childGroupId: string) =>
    `${BASE_URL}v1/rbac/groups/${groupId}/children/${childGroupId}`,

  /**
   * GET /v1/rbac/groups/{group_id}/clients
   * Lista clientes com usuários vinculados a um grupo de RBAC
   */
  LIST_CLIENTS: (groupId: string) =>
    `${BASE_URL}v1/rbac/groups/${groupId}/clients`,
} as const;

export default RBAC_GROUPS_ENDPOINTS;
