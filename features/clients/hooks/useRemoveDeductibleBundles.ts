"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deductibleLinkedBundlesQueryKey, deductibleLinkedSourcesQueryKey, removeDeductibleBundles } from "../services/deductibleSources.service";
import type { RemoveDeductibleBundlesRequest } from "../types/deductible-sources.types";

interface RemoveDeductibleBundlesInput {
  contractId: string;
  deductibleId: string;
  data: RemoveDeductibleBundlesRequest;
}

/**
 * Hook para remover pacotes de fontes da franquia.
 */
export function useRemoveDeductibleBundles() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RemoveDeductibleBundlesInput>({
    mutationFn: ({ deductibleId, data }) =>
      removeDeductibleBundles(deductibleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contracts", variables.contractId, "deductibles", variables.deductibleId],
      });
      queryClient.invalidateQueries({
        queryKey: deductibleLinkedBundlesQueryKey(variables.deductibleId),
      });
      queryClient.invalidateQueries({
        queryKey: deductibleLinkedSourcesQueryKey(variables.deductibleId),
      });
    },
  });
}
