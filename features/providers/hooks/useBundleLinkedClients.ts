"use client";

import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/shared/utils/errorParser";
import { getBundleLinkedClients } from "../services/dataSourceBundles.service";
import type {
  ListBundleLinkedClientsParams,
  PaginatedBundleLinkedClientsResponse,
} from "../types/data-source-bundles.types";

/**
 * Parâmetros padrão da listagem de clientes vinculados a um grupo de fontes.
 * Compartilhado entre a checagem por linha (ícone de vínculo) e a sidebar,
 * garantindo a mesma queryKey e reuso do cache do React Query.
 */
export const BUNDLE_LINKED_CLIENTS_QUERY_PARAMS: ListBundleLinkedClientsParams = {
  page: 1,
  pageSize: 100,
  sortBy: "name",
  sortDirection: "asc",
};

/**
 * Busca clientes (com franquias) vinculados a um grupo de fontes.
 *
 * @param bundleId - ID do grupo de fontes ou `null` para desabilitar a query
 * @param params - Parâmetros de paginação e busca
 * @param options - Opções adicionais (ex.: habilitar/desabilitar)
 */
export function useBundleLinkedClients(
  bundleId: string | null,
  params: ListBundleLinkedClientsParams = BUNDLE_LINKED_CLIENTS_QUERY_PARAMS,
  options?: { enabled?: boolean },
) {
  return useQuery<
    PaginatedBundleLinkedClientsResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ["bundle-linked-clients", bundleId, params],
    queryFn: () => getBundleLinkedClients(bundleId!, params),
    enabled: Boolean(bundleId) && (options?.enabled ?? true),
    staleTime: 60 * 1000,
  });
}
