"use client";

import { useQuery } from "@tanstack/react-query";
import { getProviders } from "../services/providers.service";
import type {
  ProviderListResponse,
  ProvidersQueryParams,
} from "../types/providers.types";

/**
 * Hook React Query para providers.
 */
export function useProviders(
  params?: ProvidersQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery<ProviderListResponse>({
    queryKey: ["providers", params],
    queryFn: () => getProviders(params),
    enabled: options?.enabled ?? true,
  });
}
