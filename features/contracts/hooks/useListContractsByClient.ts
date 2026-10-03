import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getContracts } from "../services/contracts.service";
import type {
  ListContractsByClientParams,
  PaginatedContractsResponse,
} from "../types/contracts.types";

export function useListContractsByClient(
  clientId: string | undefined,
  params?: ListContractsByClientParams,
) {
  return useQuery<PaginatedContractsResponse, AxiosError<ErrorResponse>>({
    queryKey: ["contracts", "list", clientId, params],
    queryFn: () =>
      getContracts({
        ...params,
        clientId,
      }),
    enabled: Boolean(clientId),
  });
}
