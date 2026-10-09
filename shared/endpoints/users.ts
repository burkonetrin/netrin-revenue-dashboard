import { getBaseURL } from "@/shared/utils/env";

const BASE_URL = getBaseURL();

/**
 * Endpoints da API de usuários, permissões e vínculos RBAC.
 */
export const USERS_ENDPOINTS = {
  /**
   * GET /v1/users
   * Listar usuários (paginado)
   * Query params: ?page=1&page_size=20&status=active&search=john
   */
  LIST: `${BASE_URL}v1/users`,

  /**
   * GET /v1/client/{client_id}/users/{user_id}
   * Obter detalhes de um usuário
   */
  GET_BY_ID: (clientId: string, userId: string) =>
    `${BASE_URL}v1/client/${clientId}/users/${userId}`,

  /**
   * POST /v1/client/{client_id}/users
   * Criar novo usuário
   */
  CREATE: (clientId: string) => `${BASE_URL}v1/client/${clientId}/users`,

  /**
   * PUT /v1/client/{client_id}/users/{user_id}
   * Atualizar usuário
   */
  UPDATE: (clientId: string, userId: string) => `${BASE_URL}v1/client/${clientId}/users/${userId}`,

  /**
   * PATCH /v1/client/{client_id}/users/{user_id}/status
   * Ativar/desativar usuário
   */
  UPDATE_STATUS: (clientId: string, userId: string) =>
    `${BASE_URL}v1/client/${clientId}/users/${userId}/active`,

  /**
   * PATCH /v1/client/{client_id}/users/{user_id}/password
   * Alterar senha de um usuário
   */
  UPDATE_PASSWORD: (clientId: string, userId: string) =>
    `${BASE_URL}v1/client/${clientId}/users/${userId}/password`,

  /**
   * PATCH /v1/client/{client_id}/users/{user_id}/email
   * Alterar e-mail de um usuário
   */
  UPDATE_EMAIL: (clientId: string, userId: string) =>
    `${BASE_URL}v1/client/${clientId}/users/${userId}/email`,

  /**
   * PATCH /v1/client/{client_id}/user/{user_id}/token
   * Gerar novo token para o usuário
   */
  GENERATE_TOKEN: (clientId: string, userId: string) =>
    `${BASE_URL}v1/client/${clientId}/user/${userId}/token`,

  /**
   * PATCH /v1/client/{client_id}/users/{user_id}/username
   * Alterar username de um usuário
   */
  UPDATE_USERNAME: (clientId: string, userId: string) =>
    `${BASE_URL}v1/client/${clientId}/users/${userId}/username`,

  /**
   * DELETE /v1/client/{client_id}/users/{user_id}
   * Arquiva um usuário pelo ID dentro do cliente
   */
  DELETE: (clientId: string, userId: string) =>
    `${BASE_URL}v1/client/${clientId}/users/${userId}`,

  /**
   * GET /v1/users/{user_id}/permissions
   * Listar permissões do usuário
   */
  GET_PERMISSIONS: (userId: string) =>
    `${BASE_URL}v1/users/${userId}/permissions`,

  /**
   * PUT /v1/users/{user_id}/permissions
   * Atualizar permissões do usuário
   */
  UPDATE_PERMISSIONS: (userId: string) =>
    `${BASE_URL}v1/users/${userId}/permissions`,

  /**
   * GET /v1/users/{user_id}/franchises
   * Listar franquias do usuário
   */
  GET_FRANCHISES: (userId: string | number) =>
    `${BASE_URL}v1/users/${userId}/franchises`,

  /**
   * PUT /v1/users/{user_id}/franchises
   * Atualizar franquias do usuário
   */
  UPDATE_FRANCHISES: (userId: string | number) =>
    `${BASE_URL}v1/users/${userId}/franchises`,

  /**
   * POST /v1/client/{client_id}/users/{user_id}/groups
   * Atribui um grupo RBAC a um usuário
   */
  ASSIGN_GROUP: (clientId: string, userId: string) =>
    `${BASE_URL}v1/client/${clientId}/users/${userId}/groups`,

  /**
   * DELETE /v1/client/{client_id}/users/{user_id}/groups/{group_id}
   * Remove um grupo RBAC de um usuário
   */
  REMOVE_GROUP: (clientId: string, userId: string, groupId: string) =>
    `${BASE_URL}v1/client/${clientId}/users/${userId}/groups/${groupId}`,

  /**
   * POST /v1/client/{client_id}/users/{user_id}/roles
   * Atribui uma role RBAC a um usuário
   */
  ASSIGN_ROLE: (clientId: string, userId: string) =>
    `${BASE_URL}v1/client/${clientId}/users/${userId}/roles`,

  /**
   * DELETE /v1/client/{client_id}/users/{user_id}/roles/{role_id}
   * Remove uma role RBAC de um usuário
   */
  REMOVE_ROLE: (clientId: string, userId: string, roleId: string) =>
    `${BASE_URL}v1/client/${clientId}/users/${userId}/roles/${roleId}`,

  /**
   * PUT /v1/client/{client_id}/users/{user_id}/roles/{role_id}/permissions
   * Atualiza as permissões de uma role vinculada a um usuário
   */
  UPDATE_ROLE_PERMISSIONS: (clientId: string, userId: string, roleId: string) =>
    `${BASE_URL}v1/client/${clientId}/users/${userId}/roles/${roleId}/permissions`,

  /**
   * DELETE /v1/client/{client_id}/users/{user_id}/roles/{role_id}/permissions/{permission_path}
   * Remove uma permissão de uma role vinculada a um usuário
   */
  REMOVE_ROLE_PERMISSION: (clientId: string, userId: string, roleId: string, path: string) =>
    `${BASE_URL}v1/client/${clientId}/users/${userId}/roles/${roleId}/permissions/${path}`,

  /**
   * GET /v1/users/{user_id}/deductibles
   * Lista franquias vinculadas a um usuário
   */
  LIST_DEDUCTIBLES: (userId: string) =>
    `${BASE_URL}v1/users/${userId}/deductibles`,

  /**
   * POST /v1/users/{user_id}/deductibles
   * Atribui franquias a um usuário
   */
  ASSIGN_DEDUCTIBLES: (userId: string) =>
    `${BASE_URL}v1/users/${userId}/deductibles`,

  /**
   * PATCH /v1/users/{user_id}/deductibles/{deductible_id}/active
   * Altera o status do vínculo entre usuário e franquia
   */
  UPDATE_DEDUCTIBLE_STATUS: (userId: string, deductibleId: string) =>
    `${BASE_URL}v1/users/${userId}/deductibles/${deductibleId}/active`,

  /**
   * DELETE /v1/users/{user_id}/deductibles/{deductible_id}
   * Arquiva o vínculo entre usuário e franquia
   */
  REMOVE_DEDUCTIBLE: (userId: string, deductibleId: string) =>
    `${BASE_URL}v1/users/${userId}/deductibles/${deductibleId}`,

  /**
   * GET /v1/client/{client_id}/users/{user_id}/rbac
   * Lista roles e grupos RBAC vinculados a um usuário
   */
  GET_RBAC: (clientId: string, userId: string) =>
    `${BASE_URL}v1/client/${clientId}/users/${userId}/rbac`,
} as const;

export default USERS_ENDPOINTS;
