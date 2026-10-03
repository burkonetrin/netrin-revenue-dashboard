import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getBillingList } from "../services/billing.service";
import type { BillingFilters, BillingListResponse } from "../types/billing.types";

/**
 * Parâmetros do hook de listagem de faturamento.
 */
export interface UseBillingListParams {
  filters: BillingFilters;
  page: number;
  limit: number;
}

/**
 * Hook React Query para listagem de faturamento.
 */
export function useBillingList({ filters, page, limit }: UseBillingListParams) {
  return useQuery<BillingListResponse, AxiosError<ErrorResponse>>({
    queryKey: ["billing", "list", filters, page, limit],
    queryFn: () => getBillingList(filters, page, limit),
  });
}
