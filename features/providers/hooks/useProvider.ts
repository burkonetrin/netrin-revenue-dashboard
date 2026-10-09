"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getProviderById } from "../services/providers.service";
import type { ProviderDetail } from "../types/providers.types";
import { providerDetailQueryKey } from "../utils/providersQueryInvalidation";

/**
 * Hook React Query para detalhe de um provider.
 */
export function useProvider(id?: string, options?: { enabled?: boolean }) {
  return useQuery<ProviderDetail, AxiosError<ErrorResponse>>({
    queryKey: providerDetailQueryKey(id ?? ""),
    queryFn: () => getProviderById(id ?? ""),
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}
