import { invalidateContractAutomaticRenovationViews } from "@/features/clients/utils/clientContractsTabQueryInvalidation";
import { invalidateClientPaymentInfoTabStatus } from "@/features/clients/utils/clientsPaymentInfoMutation.utils";
import { addToast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDeductible } from "../services/clients.service";
import type { CreateDeductibleRequest } from "../types/deductibles.types";

interface CreateDeductibleInput {
  clientId: string;
  contractId: string;
  data: CreateDeductibleRequest;
}

/**
 * Hook para criar franquia em um contrato.
 */
export function useCreateDeductible() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId, data }: CreateDeductibleInput) => createDeductible(contractId, data),
    onSuccess: (_, { clientId, contractId, data }) => {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId, "franchises"] });
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      invalidateClientPaymentInfoTabStatus(queryClient, clientId);

      // CA-1 / REN-01: franquia produção com AR pode ligar AR no contrato
      if (data.isTest === false && data.automaticRenovation === true) {
        invalidateContractAutomaticRenovationViews(queryClient, clientId, contractId);
      }

      addToast({
        title: "Franquia criada",
        description: "A franquia foi criada com sucesso.",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Erro ao criar",
        description: "Ocorreu um erro ao tentar criar a franquia.",
        color: "danger",
      });
    },
  });
}
