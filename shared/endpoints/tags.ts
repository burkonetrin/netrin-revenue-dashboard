import { getBaseURL } from "@/shared/utils/env";

const BASE_URL = getBaseURL();

/**
 * Endpoints da API de tags e vínculos com entidades.
 */
export const TAGS_ENDPOINTS = {
  /**
   * GET /v1/tags
   * Lista tags com paginação, filtros e busca
   */
  LIST: `${BASE_URL}v1/tags`,

  /**
   * POST /v1/tags
   * Cria uma nova tag
   */
  CREATE: `${BASE_URL}v1/tags`,

  /**
   * GET /v1/tags/{tag_id}
   * Busca uma tag pelo ID
   */
  GET_BY_ID: (tagId: string) => `${BASE_URL}v1/tags/${tagId}`,

  /**
   * DELETE /v1/tags/{tag_id}
   * Arquiva uma tag. Use force=true para remover vínculos ativos.
   */
  DELETE: (tagId: string) => `${BASE_URL}v1/tags/${tagId}`,

  /**
   * GET /v1/tags/{tag_id}/entities
   * Lista entidades vinculadas à tag
   */
  GET_ENTITIES: (tagId: string) => `${BASE_URL}v1/tags/${tagId}/entities`,

  /**
   * GET/POST /v1/tags/entities/{entity_type}/{entity_id}
   * Lista ou vincula tags a uma entidade
   */
  ENTITY_TAGS: (entityType: string, entityId: string) =>
    `${BASE_URL}v1/tags/entities/${entityType}/${entityId}`,

  /**
   * DELETE /v1/tags/entities/{entity_type}/{entity_id}/{tag_id}
   * Desvincula uma tag de uma entidade
   */
  UNASSIGN_ENTITY_TAG: (entityType: string, entityId: string, tagId: string) =>
    `${BASE_URL}v1/tags/entities/${entityType}/${entityId}/${tagId}`,
} as const;

export default TAGS_ENDPOINTS;
