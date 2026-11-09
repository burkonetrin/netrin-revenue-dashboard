/**
 * useListDeductibles Hook
 * Custom hook for fetching deductibles of a specific contract
 */

import { useQuery } from "@tanstack/react-query";
import { listDeductiblesByContract as getDeductibles } from "../services/deductibleMock.service";
import type {
  ListDeductiblesParams,
  PaginatedDeductiblesResponse,
} from "../types/deductibles.types";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/shared/utils/errorParser";

/**
 * Hook para listar franquias de um contrato
 */
export function useListDeductibles(
  contractId: string | undefined,
  params?: ListDeductiblesParams,
) {
  return useQuery<PaginatedDeductiblesResponse, AxiosError<ErrorResponse>>({
    queryKey: ["contracts", contractId, "deductibles", params],
    queryFn: () => getDeductibles(contractId!),
    enabled: Boolean(contractId),
    placeholderData: (previousData) => previousData,
  });
}
