"use client";

/**
 * Hook de mutação para submeter ajustes em lançamentos de faturamento.
 */

import { type ErrorResponse, getErrorMessage } from "@/shared/utils/errorParser";
import { addToast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { submitEntryAdjustment } from "../services/billing-adjustments.service";
import type { ApiBillingEntryResponse } from "../types/billing-api.types";
import type { BillingAdjustmentPayload } from "../types/billing-adjustment.types";
import type { BillingInvoiceScope } from "../types/billing.types";

const inFlightAdjustmentEntries = new Set<string>();

interface SubmitEntryAdjustmentInput {
  entryId: string;
  clientId?: string;
  scope: BillingInvoiceScope;
  payload: BillingAdjustmentPayload;
}

interface UseSubmitEntryAdjustmentOptions {
  showToast?: boolean;
}

/**
 * Envia ajuste à API e invalida cache de detalhe e listagem de faturamento.
 */
export function useSubmitEntryAdjustment({
  showToast = true,
}: UseSubmitEntryAdjustmentOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<ApiBillingEntryResponse, AxiosError<ErrorResponse>, SubmitEntryAdjustmentInput>({
    mutationFn: async ({ entryId, scope, payload }) => {
      if (inFlightAdjustmentEntries.has(entryId)) {
        throw new Error("Já existe um ajuste em andamento para este lançamento");
      }

      inFlightAdjustmentEntries.add(entryId);
      try {
        return await submitEntryAdjustment(entryId, payload, scope);
      } finally {
        inFlightAdjustmentEntries.delete(entryId);
      }
    },
    onSuccess: async (_, { entryId, clientId }) => {
      await queryClient.invalidateQueries({ queryKey: ["billing", "detail", "entry", entryId] });
      await queryClient.invalidateQueries({ queryKey: ["billing"] });
      if (clientId) {
        await queryClient.invalidateQueries({ queryKey: ["clients", clientId, "payment-info"] });
      }

      if (showToast) {
        addToast({
          title: "Ajuste salvo com sucesso!",
          color: "success",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      }
    },
    onError: (error) => {
      if (showToast) {
        addToast({
          title: "Erro ao salvar ajuste",
          description: getErrorMessage(error, "Não foi possível salvar o ajuste da fatura."),
          color: "danger",
        });
      }
    },
  });
}
