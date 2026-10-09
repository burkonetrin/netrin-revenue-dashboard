import { getBaseURL } from "@/shared/utils/env";

const BASE_URL = getBaseURL();

/**
 * Endpoints da API de produtos.
 */
export const PRODUCTS_ENDPOINTS = {
  /**
   * GET /v1/products
   * Lista os produtos com paginação, filtros e busca
   * Query params: page, limit, sort, order, search
   */
  LIST: `${BASE_URL}v1/products`,

  /**
   * GET /v1/products/sellable
   * Lista os produtos vendáveis com paginação, filtros e busca
   */
  LIST_SELLABLE: `${BASE_URL}v1/products/sellable`,

  /**
   * POST /v1/products
   * Cria um novo produto
   */
  CREATE: `${BASE_URL}v1/products`,

  /**
   * GET /v1/products/{product_id}
   * Retorna um produto pelo ID
   */
  GET_BY_ID: (productId: string) => `${BASE_URL}v1/products/${productId}`,

  /**
   * PUT /v1/products/{product_id}
   * Atualiza um produto pelo ID
   */
  UPDATE: (productId: string) => `${BASE_URL}v1/products/${productId}`,

  /**
   * DELETE /v1/products/{product_id}
   * Arquiva um produto pelo ID
   */
  DELETE: (productId: string) => `${BASE_URL}v1/products/${productId}`,

  /**
   * PATCH /v1/products/{product_id}/active
   * Altera o status de ativação de um produto
   */
  PATCH_ACTIVE: (productId: string) => `${BASE_URL}v1/products/${productId}/active`,
} as const;

export default PRODUCTS_ENDPOINTS;
