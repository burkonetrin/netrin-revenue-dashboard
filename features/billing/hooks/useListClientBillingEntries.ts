import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getClientOpenBillingEntries } from "../services/billing.service";
import type { BillingListResponse } from "../types/billing.types";

/**
 * Parâmetros do hook de lançamentos do cliente.
 */
export interface UseListClientBillingEntriesParams {
  clientId: string;
  page: number;
  limit: number;
}

/**
 * Hook React Query para histórico unificado de faturamento do cliente.
 */
export function useListClientBillingEntries({
  clientId,
  page,
  limit,
}: UseListClientBillingEntriesParams) {
  return useQuery<BillingListResponse, AxiosError<ErrorResponse>>({
    queryKey: ["billing", "client-entries", clientId, { page, limit }],
    queryFn: () => getClientOpenBillingEntries(clientId, { page, limit }),
    enabled: Boolean(clientId),
  });
}
