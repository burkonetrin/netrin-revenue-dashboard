import { getBaseURL } from "@/shared/utils/env";

const BASE_URL = getBaseURL();

/**
 * Endpoints da API de franquias (deductibles) e modelos de cobrança.
 */
export const DEDUCTIBLE_ENDPOINTS = {
  /**
   * GET /v1/deductible/billing-models
   * Lista modelos de cobrança disponíveis
   */
  BILLING_MODELS: `${BASE_URL}v1/deductible/billing-models`,

  /**
   * GET /v1/deductible/{deductible_id}/data-sources
   * Lista fontes de dados vinculadas a uma franquia
   *
   * POST /v1/deductible/{deductible_id}/data-sources
   * Atribui fontes de dados a uma franquia
   */
  DATA_SOURCES: (deductibleId: string) => `${BASE_URL}v1/deductible/${deductibleId}/data-sources`,

  /**
   * DELETE /v1/deductible/{deductible_id}/data-sources
   * Remove fontes de dados de uma franquia
   */
  REMOVE_DATA_SOURCES: (deductibleId: string) =>
    `${BASE_URL}v1/deductible/${deductibleId}/data-sources`,

  /**
   * GET /v1/deductible/{deductible_id}/data-source-bundles
   * Lista pacotes de fontes vinculados a uma franquia
   *
   * POST /v1/deductible/{deductible_id}/data-source-bundles
   * Atribui pacotes de fontes a uma franquia
   */
  DATA_SOURCE_BUNDLES: (deductibleId: string) =>
    `${BASE_URL}v1/deductible/${deductibleId}/data-source-bundles`,

  /**
   * DELETE /v1/deductible/{deductible_id}/data-source-bundles
   * Remove pacotes de fontes de uma franquia
   */
  REMOVE_DATA_SOURCE_BUNDLES: (deductibleId: string) =>
    `${BASE_URL}v1/deductible/${deductibleId}/data-source-bundles`,
} as const;

export default DEDUCTIBLE_ENDPOINTS;
