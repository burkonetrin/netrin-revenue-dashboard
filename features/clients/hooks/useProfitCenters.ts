"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getProfitCenters } from "../services/clientsMock.service";

export function useProfitCenters(enabled = true) {
  return useQuery<
    Awaited<ReturnType<typeof getProfitCenters>>,
    AxiosError<ErrorResponse>
  >({
    queryKey: ["profit-centers"],
    queryFn: getProfitCenters,
    enabled,
  });
}
