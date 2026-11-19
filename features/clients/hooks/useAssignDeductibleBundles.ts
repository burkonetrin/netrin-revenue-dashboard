"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignDeductibleBundles, deductibleLinkedBundlesQueryKey, deductibleLinkedSourcesQueryKey } from "../services/deductibleSources.service";
import type { AssignDeductibleBundlesRequest } from "../types/deductible-sources.types";

interface AssignDeductibleBundlesInput {
  contractId: string;
  deductibleId: string;
  data: AssignDeductibleBundlesRequest;
}

/**
 * Hook para vincular pacotes de fontes à franquia.
 */
export function useAssignDeductibleBundles() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AssignDeductibleBundlesInput>({
    mutationFn: ({ deductibleId, data }) =>
      assignDeductibleBundles(deductibleId, data),
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
