"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deductibleLinkedSourcesQueryKey, removeDeductibleDataSources } from "../services/deductibleSources.service";
import type { AssignDeductibleDataSourcesRequest } from "../types/deductible-sources.types";

interface RemoveDeductibleDataSourcesInput {
  contractId: string;
  deductibleId: string;
  data: AssignDeductibleDataSourcesRequest;
}

/**
 * Hook para remover fontes da franquia.
 */
export function useRemoveDeductibleDataSources() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RemoveDeductibleDataSourcesInput>({
    mutationFn: ({ deductibleId, data }) =>
      removeDeductibleDataSources(deductibleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contracts", variables.contractId, "deductibles", variables.deductibleId],
      });
      queryClient.invalidateQueries({
        queryKey: deductibleLinkedSourcesQueryKey(variables.deductibleId),
      });
    },
  });
}
