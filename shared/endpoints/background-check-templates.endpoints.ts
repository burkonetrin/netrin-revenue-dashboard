import { getBaseURL } from "@/shared/utils/env";

const BASE_URL = getBaseURL();

/**
 * Endpoints da API de templates de background check e vínculos com franquias.
 */
export const BACKGROUND_CHECK_TEMPLATES_ENDPOINTS = {
  /**
   * GET /v1/background-check-templates
   * Lista templates com paginação, filtros e busca
   */
  LIST: `${BASE_URL}v1/background-check-templates`,

  /**
   * POST /v1/background-check-templates
   * Cria um novo template
   */
  CREATE: `${BASE_URL}v1/background-check-templates`,

  /**
   * GET /v1/background-check-templates/{id}
   * Retorna um template pelo ID
   */
  GET_BY_ID: (id: string) => `${BASE_URL}v1/background-check-templates/${id}`,

  /**
   * PUT /v1/background-check-templates/{id}
   * Atualiza um template pelo ID
   */
  UPDATE: (id: string) => `${BASE_URL}v1/background-check-templates/${id}`,

  /**
   * DELETE /v1/background-check-templates/{id}
   * Arquiva um template pelo ID
   */
  DELETE: (id: string) => `${BASE_URL}v1/background-check-templates/${id}`,

  /**
   * PATCH /v1/background-check-templates/{id}/active
   * Altera o status de ativação de um template
   */
  PATCH_ACTIVE: (id: string) => `${BASE_URL}v1/background-check-templates/${id}/active`,

  /**
   * POST /v1/background-check-templates/{id}/data-sources
   * Atribui fontes de dados a um template
   */
  ASSIGN_DATA_SOURCES: (id: string) =>
    `${BASE_URL}v1/background-check-templates/${id}/data-sources`,

  /**
   * GET /v1/background-check-templates/{id}/data-sources
   * Lista fontes de dados vinculadas a um template
   */
  LIST_DATA_SOURCES: (id: string) => `${BASE_URL}v1/background-check-templates/${id}/data-sources`,

  /**
   * DELETE /v1/background-check-templates/{id}/data-sources
   * Remove fontes de dados de um template
   */
  REMOVE_DATA_SOURCES: (id: string) =>
    `${BASE_URL}v1/background-check-templates/${id}/data-sources`,

  /**
   * GET /v1/deductible/{deductible_id}/background-check-templates
   * Lista templates vinculados a uma franquia
   */
  LIST_BY_DEDUCTIBLE: (deductibleId: string) =>
    `${BASE_URL}v1/deductible/${deductibleId}/background-check-templates`,

  /**
   * POST /v1/deductible/{deductible_id}/background-check-templates
   * Atribui templates a uma franquia
   */
  ASSIGN_TO_DEDUCTIBLE: (deductibleId: string) =>
    `${BASE_URL}v1/deductible/${deductibleId}/background-check-templates`,

  /**
   * DELETE /v1/deductible/{deductible_id}/background-check-templates
   * Remove templates de uma franquia
   */
  REMOVE_FROM_DEDUCTIBLE: (deductibleId: string) =>
    `${BASE_URL}v1/deductible/${deductibleId}/background-check-templates`,
} as const;

export default BACKGROUND_CHECK_TEMPLATES_ENDPOINTS;
