"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getProfitCenters } from "../services/clientsMock.service";

export function useProfitCenters(
  enabled = true,
  options: { useFinancialManagementMock?: boolean } = {},
) {
  const useFinancialManagementMock = options.useFinancialManagementMock ?? false;

  return useQuery<
    Awaited<ReturnType<typeof getProfitCenters>>,
    AxiosError<ErrorResponse>
  >({
    queryKey: useFinancialManagementMock
      ? ["profit-centers", "financial-management-mock"]
      : ["profit-centers"],
    queryFn: () => getProfitCenters({ useFinancialManagementMock }),
    enabled,
  });
}
