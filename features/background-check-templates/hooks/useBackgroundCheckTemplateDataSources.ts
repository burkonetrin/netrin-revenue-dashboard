import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getBackgroundCheckTemplateDataSources } from "../services/background-check-templates.service";
import type { BackgroundCheckTemplateDataSourceOption } from "../types/background-check-templates.types";

export function useBackgroundCheckTemplateDataSources(
  templateId?: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery<BackgroundCheckTemplateDataSourceOption[], AxiosError<ErrorResponse>>({
    queryKey: ["background-check-template-data-sources", templateId],
    queryFn: () => getBackgroundCheckTemplateDataSources(templateId ?? ""),
    enabled: Boolean(templateId) && (options?.enabled ?? true),
  });
}
