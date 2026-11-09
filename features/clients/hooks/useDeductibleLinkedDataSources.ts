"use client";

import { useQuery } from "@tanstack/react-query";
import {
  deductibleLinkedSourcesQueryKey,
  getDeductibleLinkedDataSources,
} from "../services/deductibleSources.service";
import type { DataSource } from "@/features/providers/types/data-sources.types";

/**
 * Hook para listar fontes vinculadas à franquia.
 */
export function useDeductibleLinkedDataSources(
  deductibleId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery<DataSource[]>({
    queryKey: deductibleLinkedSourcesQueryKey(deductibleId ?? ""),
    queryFn: () => {
      if (!deductibleId) {
        throw new Error("Deductible id is required");
      }
      return getDeductibleLinkedDataSources(deductibleId);
    },
    enabled: Boolean(deductibleId) && (options?.enabled ?? true),
  });
}
