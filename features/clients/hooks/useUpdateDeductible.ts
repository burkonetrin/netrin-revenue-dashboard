/**
 * useUpdateDeductible Hook
 * Atualiza uma franquia via PUT /v1/contract/{contract_id}/deductible/{deductible_id}
 */

import { invalidateContractAutomaticRenovationViews } from "@/features/clients/utils/clientContractsTabQueryInvalidation";
import type { ErrorResponse } from "@/shared/utils/errorParser";
import { addToast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { updateDeductible } from "../services/clients.service";
import type { CreateDeductibleRequest, DeductibleResponse } from "../types/deductibles.types";

interface UpdateDeductibleInput {
  clientId: string;
  contractId: string;
  deductibleId: string;
  data: CreateDeductibleRequest;
}

/**
 * Hook para atualizar franquia.
 */
export function useUpdateDeductible() {
  const queryClient = useQueryClient();

  return useMutation<DeductibleResponse, AxiosError<ErrorResponse>, UpdateDeductibleInput>({
    mutationFn: async ({ contractId, deductibleId, data }) => {
      return await updateDeductible(contractId, deductibleId, data);
    },
    onSuccess: (_, { clientId, contractId, deductibleId, data }) => {
      queryClient.invalidateQueries({
        queryKey: ["contracts", contractId, "deductibles", deductibleId],
      });
      queryClient.invalidateQueries({
        queryKey: ["contracts", contractId, "deductibles"],
      });

      // CA-1 / REN-01: franquia produção com AR pode ligar AR no contrato
      if (data.isTest === false && data.automaticRenovation === true) {
        invalidateContractAutomaticRenovationViews(queryClient, clientId, contractId);
      }

      addToast({
        title: "Franquia atualizada",
        description: "A franquia foi atualizada com sucesso.",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao tentar atualizar a franquia.",
        color: "danger",
      });
    },
  });
}
