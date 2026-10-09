"use client";

import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/shared/utils/errorParser";
import type {
  ListBundleLinkedClientsParams,
  PaginatedBundleLinkedClientsResponse,
} from "@/features/providers/types/data-source-bundles.types";
import { getBackgroundCheckTemplateLinkedClients } from "../services/background-check-templates.service";

export const TEMPLATE_LINKED_CLIENTS_QUERY_PARAMS: ListBundleLinkedClientsParams = {
  page: 1,
  pageSize: 100,
  sortBy: "name",
  sortDirection: "asc",
};

export function useBackgroundCheckTemplateLinkedClients(
  templateId: string | null,
  params: ListBundleLinkedClientsParams = TEMPLATE_LINKED_CLIENTS_QUERY_PARAMS,
  options?: { enabled?: boolean },
) {
  return useQuery<PaginatedBundleLinkedClientsResponse, AxiosError<ErrorResponse>>({
    queryKey: ["background-check-template-linked-clients", templateId, params],
    queryFn: () => getBackgroundCheckTemplateLinkedClients(templateId!, params),
    enabled: Boolean(templateId) && (options?.enabled ?? true),
    staleTime: 60 * 1000,
  });
}
