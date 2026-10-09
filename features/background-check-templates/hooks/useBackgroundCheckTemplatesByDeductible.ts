import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getBackgroundCheckTemplatesByDeductible } from "../services/background-check-templates.service";
import type { BackgroundCheckTemplate } from "../types/background-check-templates.types";

export function useBackgroundCheckTemplatesByDeductible(
  deductibleId?: string,
  options?: { enabled?: boolean },
) {
  return useQuery<BackgroundCheckTemplate[], AxiosError<ErrorResponse>>({
    queryKey: ["deductible-background-check-templates", deductibleId],
    queryFn: () => getBackgroundCheckTemplatesByDeductible(deductibleId ?? ""),
    enabled: Boolean(deductibleId) && (options?.enabled ?? true),
  });
}
