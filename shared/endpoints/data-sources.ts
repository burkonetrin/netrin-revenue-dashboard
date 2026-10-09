import { getBaseURL } from "@/shared/utils/env";

const BASE_URL = getBaseURL();

/**
 * Endpoints da API de fontes de dados.
 */
export const DATA_SOURCES_ENDPOINTS = {
  /**
   * GET /v1/data-sources
   * Listar fontes de dados com paginação, filtros e busca
   */
  LIST: `${BASE_URL}v1/data-sources`,

  /**
   * GET /v1/data-sources/{data_source_id}
   * Retorna uma fonte de dados pelo ID
   */
  GET_BY_ID: (dataSourceId: string) =>
    `${BASE_URL}v1/data-sources/${dataSourceId}`,

  /**
   * PUT /v1/data-sources/{data_source_id}
   * Atualiza uma fonte de dados pelo ID
   */
  UPDATE: (dataSourceId: string) =>
    `${BASE_URL}v1/data-sources/${dataSourceId}`,

  /**
   * PATCH /v1/data-sources/{data_source_id}/active
   * Altera o status de ativação de uma fonte de dados
   */
  PATCH_ACTIVE: (dataSourceId: string) =>
    `${BASE_URL}v1/data-sources/${dataSourceId}/active`,
} as const;

export default DATA_SOURCES_ENDPOINTS;
