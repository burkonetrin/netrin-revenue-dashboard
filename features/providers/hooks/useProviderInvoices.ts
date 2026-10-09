"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { listProviderInvoices } from "../services/providerInvoices.service";
import type {
  ProviderInvoiceListResponse,
  ProviderInvoicesQueryParams,
} from "../types/providerInvoices.types";

export function providerInvoicesQueryKey(providerId: string, params?: ProviderInvoicesQueryParams) {
  return ["providers", "invoices", providerId, params] as const;
}

/**
 * Hook React Query para listagem de faturas/competências do fornecedor.
 */
export function useProviderInvoices(
  providerId?: string,
  params?: ProviderInvoicesQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery<ProviderInvoiceListResponse, AxiosError<ErrorResponse>>({
    queryKey: providerInvoicesQueryKey(providerId ?? "", params),
    queryFn: () => listProviderInvoices(providerId ?? "", params),
    enabled: Boolean(providerId) && (options?.enabled ?? true),
  });
}
