import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getBackgroundCheckTemplates } from "../services/background-check-templates.service";
import type {
  ListBackgroundCheckTemplatesParams,
  PaginatedBackgroundCheckTemplatesResponse,
} from "../types/background-check-templates.types";

export function useListBackgroundCheckTemplates(
  params?: ListBackgroundCheckTemplatesParams,
  options?: { enabled?: boolean },
) {
  return useQuery<PaginatedBackgroundCheckTemplatesResponse, AxiosError<ErrorResponse>>({
    queryKey: ["background-check-templates", params],
    queryFn: () => getBackgroundCheckTemplates(params),
    enabled: options?.enabled ?? true,
    placeholderData: (previousData) => previousData,
  });
}
