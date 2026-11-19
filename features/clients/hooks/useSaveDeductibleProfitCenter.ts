"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { saveDeductibleProfitCenter } from "../services/payment-info.service";
import type {
  DeductibleProfitCenterRequest,
  DeductibleProfitCenterResponse,
} from "../types/contractsFranchises.types";
import type { ErrorResponse } from "@/shared/utils/errorParser";
import {
  invalidateDeductibleProfitCenter,
  showProfitCenterSaveErrorToast,
  showProfitCenterSaveSuccessToast,
} from "../utils/deductibleProfitCenterMutation.utils";

interface SaveDeductibleProfitCenterInput {
  clientId: string;
  contractId: string;
  deductibleId: string;
  data: DeductibleProfitCenterRequest;
}

/**
 * Hook para salvar centros de lucro da franquia.
 */
export function useSaveDeductibleProfitCenter({ showToast = true } = {}) {
  const queryClient = useQueryClient();

  return useMutation<
    DeductibleProfitCenterResponse,
    AxiosError<ErrorResponse>,
    SaveDeductibleProfitCenterInput
  >({
    mutationFn: async ({ clientId, contractId, deductibleId, data }) =>
      saveDeductibleProfitCenter(clientId, contractId, deductibleId, data),
    onSuccess: (_, { clientId, contractId, deductibleId }) => {
      invalidateDeductibleProfitCenter(queryClient, clientId, contractId, deductibleId);
      if (showToast) {
        showProfitCenterSaveSuccessToast();
      }
    },
    onError: (error) => {
      if (showToast) {
        showProfitCenterSaveErrorToast(error);
      }
    },
  });
}
