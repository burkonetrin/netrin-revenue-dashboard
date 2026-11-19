"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignDeductibleDataSources, deductibleLinkedSourcesQueryKey } from "../services/deductibleSources.service";
import type { AssignDeductibleDataSourcesRequest } from "../types/deductible-sources.types";

interface AssignDeductibleDataSourcesInput {
  contractId: string;
  deductibleId: string;
  data: AssignDeductibleDataSourcesRequest;
}

/**
 * Hook para vincular fontes à franquia.
 */
export function useAssignDeductibleDataSources() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AssignDeductibleDataSourcesInput>({
    mutationFn: ({ deductibleId, data }) =>
      assignDeductibleDataSources(deductibleId, data),
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
