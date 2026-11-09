/**
 * useBillingModels Hook
 * Custom hook for fetching available billing model options
 */

import { useQuery } from "@tanstack/react-query";
import { MOCK_BILLING_MODELS } from "../services/deductibleMock.service";
import type { BillingModelOption } from "../types/deductibles.types";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/shared/utils/errorParser";

const STALE_TIME_MS = 1000 * 60 * 30; // 30 minutes

/**
 * Hook para listar modelos de cobrança disponíveis.
 */
export function useBillingModels() {
  return useQuery<BillingModelOption[], AxiosError<ErrorResponse>>({
    queryKey: ["deductible", "billing-models"],
    queryFn: async () => MOCK_BILLING_MODELS,
    staleTime: STALE_TIME_MS,
  });
}
