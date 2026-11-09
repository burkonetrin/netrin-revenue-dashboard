"use client";

import { useQuery } from "@tanstack/react-query";
import {
  deductibleLinkedBundlesQueryKey,
  getDeductibleLinkedBundles,
} from "../services/deductibleSources.service";
import type { DeductibleLinkedBundle } from "../types/deductible-sources.types";

/**
 * Hook para listar pacotes vinculados à franquia.
 */
export function useDeductibleLinkedBundles(
  deductibleId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery<DeductibleLinkedBundle[]>({
    queryKey: deductibleLinkedBundlesQueryKey(deductibleId ?? ""),
    queryFn: () => {
      if (!deductibleId) {
        throw new Error("Deductible id is required");
      }
      return getDeductibleLinkedBundles(deductibleId);
    },
    enabled: Boolean(deductibleId) && (options?.enabled ?? true),
  });
}
