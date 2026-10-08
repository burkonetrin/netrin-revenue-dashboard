import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getBillingTask } from "../services/billing.service";
import type { ApiBillingTaskResponse } from "../types/billing-api.types";

export function useBillingTask(taskId: string, enabled: boolean, attempt: number) {
  return useQuery<ApiBillingTaskResponse, AxiosError<ErrorResponse>>({
    queryKey: ["billing", "task", taskId, attempt],
    queryFn: () => getBillingTask(taskId),
    enabled,
    retry: false,
  });
}
