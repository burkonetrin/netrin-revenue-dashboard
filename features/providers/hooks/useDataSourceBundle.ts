"use client";

import { useQuery } from "@tanstack/react-query";
import { getDataSourceBundleById } from "../services/dataSourceBundles.service";
import type { DataSourceBundleApiDetailResponse } from "../types/data-source-bundles.types";

/**
 * Hook React Query para buscar bundle de fontes por ID.
 */
export function useDataSourceBundle(
  id: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery<DataSourceBundleApiDetailResponse>({
    queryKey: ["data-source-bundles", id],
    queryFn: () => {
      if (!id) {
        throw new Error("Data source bundle id is required");
      }
      return getDataSourceBundleById(id);
    },
    enabled: Boolean(id) && (options?.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
  });
}
