"use client";

import { mergeDataSourceBundlesById } from "@/features/clients/utils/mergeDataSourceBundles.utils";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { getDataSourceBundles } from "../services/dataSourceBundles.service";
import type { DataSourceBundle } from "../types/data-source-bundles.types";

const BUNDLE_LIST_PARAMS = {
  page: 1,
  pageSize: 100,
  isActive: true,
  sortBy: "name",
  sortDirection: "asc" as const,
};

/**
 * Hook React Query para bundles vinculados a produtos.
 * @param productIds - product ids
 */
export function useDataSourceBundlesByProductIds(
  productIds: string[],
  options?: { enabled?: boolean },
) {
  const isEnabled = options?.enabled ?? true;
  const uniqueProductIds = useMemo(
    () => Array.from(new Set(productIds.filter(Boolean))),
    [productIds],
  );

  const bundleQueries = useQueries({
    queries: uniqueProductIds.map((productId) => ({
      queryKey: ["data-source-bundles", { ...BUNDLE_LIST_PARAMS, productId }] as const,
      queryFn: () => getDataSourceBundles({ ...BUNDLE_LIST_PARAMS, productId }),
      enabled: uniqueProductIds.length > 0 && isEnabled,
    })),
  });

  const bundles = useMemo(() => {
    const lists = bundleQueries.map((query) => query.data?.data ?? []) as DataSourceBundle[][];
    if (!isEnabled) return [];

    return mergeDataSourceBundlesById(lists).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [bundleQueries, isEnabled]);

  const isLoading =
    uniqueProductIds.length > 0 && isEnabled && bundleQueries.some((query) => query.isLoading);
  const isError = bundleQueries.some((query) => query.isError);

  return {
    bundles,
    isLoading,
    isError,
  };
}
