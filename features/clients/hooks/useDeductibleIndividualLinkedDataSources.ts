"use client";

import { getDataSourceBundleById } from "@/features/providers/services/dataSourceBundles.service";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { resolveIndividualLinkedDataSources } from "../utils/deductibleIndividualSources.utils";
import { useDeductibleLinkedBundles } from "./useDeductibleLinkedBundles";
import { useDeductibleLinkedDataSources } from "./useDeductibleLinkedDataSources";

/**
 * Lista fontes e grupos vinculados à franquia, separando fontes individuais
 * das fontes replicadas por grupos (syncWithDeductible).
 */
export function useDeductibleIndividualLinkedDataSources(
  deductibleId: string | undefined,
  options?: { enabled?: boolean },
) {
  const enabled = Boolean(deductibleId) && (options?.enabled ?? true);

  const { data: linkedBundles, isLoading: isLoadingBundles } = useDeductibleLinkedBundles(
    deductibleId,
    { enabled },
  );

  const { data: linkedSources, isLoading: isLoadingSources } = useDeductibleLinkedDataSources(
    deductibleId,
    { enabled },
  );

  const bundles = linkedBundles ?? [];
  const bundleIds = useMemo(() => bundles.map((bundle) => bundle.id), [bundles]);

  const bundleDetailQueries = useQueries({
    queries: bundleIds.map((bundleId) => ({
      queryKey: ["data-source-bundles", bundleId],
      queryFn: () => getDataSourceBundleById(bundleId),
      enabled,
    })),
  });

  const isLoadingBundleDetails =
    bundleIds.length > 0 && bundleDetailQueries.some((query) => query.isLoading);

  const bundleDetails = useMemo(
    () =>
      bundleDetailQueries
        .map((query) => query.data)
        .filter((detail): detail is NonNullable<typeof detail> => Boolean(detail)),
    [bundleDetailQueries],
  );

  const individualSources = useMemo(
    () =>
      resolveIndividualLinkedDataSources({
        linkedSources: linkedSources ?? [],
        bundleIds,
        bundleDetails,
        isLoadingBundles,
        isLoadingSources,
        isLoadingBundleDetails,
      }),
    [
      linkedSources,
      bundleIds,
      bundleDetails,
      isLoadingBundles,
      isLoadingSources,
      isLoadingBundleDetails,
    ],
  );

  return {
    bundles,
    individualSources,
    allLinkedSources: linkedSources ?? [],
    isLoading: isLoadingBundles || isLoadingSources || isLoadingBundleDetails,
    isLoadingBundles,
    isLoadingSources,
    isLoadingBundleDetails,
  };
}
