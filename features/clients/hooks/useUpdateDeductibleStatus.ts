/**
 * useUpdateDeductibleStatus Hook
 * Atualiza status (ativo/inativo) da franquia via PATCH /v1/contract/{contract_id}/deductible/{deductible_id}/active
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDeductibleStatus } from "../services/clients.service";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/shared/utils/errorParser";
import { addToast } from "@heroui/react";

interface UpdateDeductibleStatusInput {
  contractId: string;
  deductibleId: string;
  isActive: boolean;
  /** Ao inativar: manter ou remover da competência em aberto (protótipo). */
  competenceBilling?: "keep" | "remove";
}

/**
 * Hook para atualizar status da franquia.
 */
export function useUpdateDeductibleStatus() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ErrorResponse>, UpdateDeductibleStatusInput>({
    mutationFn: async ({ contractId, deductibleId, isActive }) => {
      await updateDeductibleStatus(contractId, deductibleId, isActive);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contracts", variables.contractId, "deductibles", variables.deductibleId],
      });
      queryClient.invalidateQueries({
        queryKey: ["contracts", variables.contractId, "deductibles"],
      });

      let description = "O status da franquia foi atualizado com sucesso.";
      if (!variables.isActive) {
        description =
          variables.competenceBilling === "remove"
            ? "Franquia inativada e removida do faturamento da competência atual."
            : "Franquia inativada. Permanece contabilizada no faturamento da competência atual.";
      }

      addToast({
        title: "Status atualizado",
        description,
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao tentar atualizar o status da franquia.",
        color: "danger",
      });
    },
  });
}
