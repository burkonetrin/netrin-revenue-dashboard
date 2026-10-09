import { getBaseURL } from "@/shared/utils/env";

const BASE_URL = getBaseURL();

/**
 * Endpoints da API de pacotes de fontes de dados.
 */
export const DATA_SOURCE_BUNDLES_ENDPOINTS = {
  /**
   * GET /v1/data-source-bundles
   * Lista pacotes de fontes de dados com paginação, filtros e busca
   */
  LIST: `${BASE_URL}v1/data-source-bundles`,

  /**
   * POST /v1/data-source-bundles
   * Cria um novo pacote de fontes de dados
   */
  CREATE: `${BASE_URL}v1/data-source-bundles`,

  /**
   * GET /v1/data-source-bundles/{data_source_bundle_id}
   * Retorna um pacote de fontes de dados pelo ID
   */
  GET_BY_ID: (dataSourceBundleId: string) =>
    `${BASE_URL}v1/data-source-bundles/${dataSourceBundleId}`,

  /**
   * PUT /v1/data-source-bundles/{data_source_bundle_id}
   * Atualiza um pacote de fontes de dados pelo ID
   */
  UPDATE: (dataSourceBundleId: string) => `${BASE_URL}v1/data-source-bundles/${dataSourceBundleId}`,

  /**
   * PATCH /v1/data-source-bundles/{data_source_bundle_id}/active
   * Altera o status de ativação de um pacote de fontes de dados
   */
  PATCH_ACTIVE: (dataSourceBundleId: string) =>
    `${BASE_URL}v1/data-source-bundles/${dataSourceBundleId}/active`,

  /**
   * DELETE /v1/data-source-bundles/{data_source_bundle_id}
   * Arquiva um pacote de fontes de dados pelo ID
   */
  DELETE: (dataSourceBundleId: string) => `${BASE_URL}v1/data-source-bundles/${dataSourceBundleId}`,

  /**
   * POST /v1/data-source-bundles/{data_source_bundle_id}/data-sources
   * Atribui fontes de dados a um pacote
   */
  ASSIGN_DATA_SOURCES: (dataSourceBundleId: string) =>
    `${BASE_URL}v1/data-source-bundles/${dataSourceBundleId}/data-sources`,

  /**
   * DELETE /v1/data-source-bundles/{data_source_bundle_id}/data-sources
   * Remove fontes de dados de um pacote
   */
  REMOVE_DATA_SOURCES: (dataSourceBundleId: string) =>
    `${BASE_URL}v1/data-source-bundles/${dataSourceBundleId}/data-sources`,

  /**
   * GET /v1/data-source-bundles/{data_source_bundle_id}/clients
   * Lista clientes (com suas franquias) vinculados a um pacote de fontes de dados
   */
  LIST_CLIENTS: (dataSourceBundleId: string) =>
    `${BASE_URL}v1/data-source-bundles/${dataSourceBundleId}/clients`,
} as const;

export default DATA_SOURCE_BUNDLES_ENDPOINTS;
