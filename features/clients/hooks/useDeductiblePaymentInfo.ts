"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getDeductiblePaymentInfo } from "../services/payment-info.service";
import type { PaymentInfoResponse } from "../types/contractsFranchises.types";

/**
 * Hook para buscar pagamento da franquia.
 */
export function useDeductiblePaymentInfo(
  clientId: string | undefined,
  contractId: string | undefined,
  deductibleId: string | undefined,
) {
  return useQuery<PaymentInfoResponse | null, AxiosError<ErrorResponse>>({
    queryKey: [
      "clients",
      clientId,
      "contract",
      contractId,
      "deductible",
      deductibleId,
      "payment-info",
    ],
    queryFn: async () => {
      if (!clientId) throw new Error("clientId is required");
      if (!contractId) throw new Error("contractId is required");
      if (!deductibleId) throw new Error("deductibleId is required");
      return await getDeductiblePaymentInfo(clientId, contractId, deductibleId);
    },
    enabled: Boolean(clientId) && Boolean(contractId) && Boolean(deductibleId),
  });
}
