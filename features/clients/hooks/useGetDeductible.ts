/**
 * useGetDeductible Hook
 * Custom hook for fetching a single deductible by ID
 */

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getDeductibleById } from "../services/deductibleMock.service";
import type { DetailedDeductibleResponse } from "../types/deductibles.types";

/**
 * Hook para buscar uma franquia pelo ID
 */
export function useGetDeductible(contractId: string | undefined, deductibleId: string | undefined) {
  return useQuery<DetailedDeductibleResponse, AxiosError<ErrorResponse>>({
    queryKey: ["contracts", contractId, "deductibles", deductibleId],
    queryFn: () => {
      if (!contractId || !deductibleId) {
        throw new Error("Contract id and deductible id are required");
      }
      return getDeductibleById(contractId, deductibleId);
    },
    enabled: Boolean(contractId) && Boolean(deductibleId),
    refetchOnMount: "always",
  });
}
