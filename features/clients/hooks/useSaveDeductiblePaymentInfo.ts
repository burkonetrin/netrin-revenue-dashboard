"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { saveDeductiblePaymentInfo } from "../services/payment-info.service";
import type { PaymentInfoRequest, PaymentInfoResponse } from "../types/contractsFranchises.types";
import type { ErrorResponse } from "@/shared/utils/errorParser";
import {
  invalidateDeductiblePaymentInfo,
  showPaymentInfoSaveErrorToast,
  showPaymentInfoSaveSuccessToast,
  reassessBillingAfterPaymentInfo,
} from "../utils/clientsPaymentInfoMutation.utils";

interface SaveDeductiblePaymentInfoInput {
  clientId: string;
  contractId: string;
  deductibleId: string;
  data: PaymentInfoRequest;
}

interface UseSaveDeductiblePaymentInfoOptions {
  showToast?: boolean;
}

/**
 * Hook para salvar pagamento da franquia.
 */
export function useSaveDeductiblePaymentInfo({
  showToast = true,
}: UseSaveDeductiblePaymentInfoOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<
    PaymentInfoResponse,
    AxiosError<ErrorResponse>,
    SaveDeductiblePaymentInfoInput
  >({
    mutationFn: async ({ clientId, contractId, deductibleId, data }) => {
      const result = await saveDeductiblePaymentInfo(clientId, contractId, deductibleId, data);
      await reassessBillingAfterPaymentInfo(clientId, true, queryClient);
      return result;
    },
    onSuccess: (_, { clientId, contractId, deductibleId }) => {
      invalidateDeductiblePaymentInfo(queryClient, clientId, contractId, deductibleId);
      if (showToast) {
        showPaymentInfoSaveSuccessToast();
      }
    },
    onError: (error) => {
      if (showToast) {
        showPaymentInfoSaveErrorToast(error);
      }
    },
  });
}
