import { getBaseURL } from "@/shared/utils/env";

const BASE_URL = getBaseURL();

/**
 * Endpoints da API de validação bancária (volumetria e qualidade).
 */
export const BANK_VALIDATION_ENDPOINTS = {
  /**
   * GET /v1/bank-validation/volumetry
   * Query params: reference_month (YYYY-MM)
   */
  VOLUMETRY: `${BASE_URL}v1/bank-validation/volumetry`,
  /**
   * GET /v1/bank-validation/transaction-quality
   * Query params: reference_month (YYYY-MM)
   */
  TRANSACTION_QUALITY: `${BASE_URL}v1/bank-validation/transaction-quality`,
} as const;

export default BANK_VALIDATION_ENDPOINTS;
