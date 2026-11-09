"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getDeductibleProfitCenter } from "../services/payment-info.service";
import type { DeductibleProfitCenterResponse } from "../types/contractsFranchises.types";

/**
 * Hook para buscar centros de lucro da franquia.
 */
export function useDeductibleProfitCenter(
  clientId: string | undefined,
  contractId: string | undefined,
  deductibleId: string | undefined,
) {
  return useQuery<DeductibleProfitCenterResponse | null, AxiosError<ErrorResponse>>({
    queryKey: [
      "clients",
      clientId,
      "contract",
      contractId,
      "deductible",
      deductibleId,
      "profit-center",
    ],
    queryFn: async () => {
      if (!clientId) throw new Error("clientId is required");
      if (!contractId) throw new Error("contractId is required");
      if (!deductibleId) throw new Error("deductibleId is required");
      return await getDeductibleProfitCenter(clientId, contractId, deductibleId);
    },
    enabled: Boolean(clientId) && Boolean(contractId) && Boolean(deductibleId),
  });
}
