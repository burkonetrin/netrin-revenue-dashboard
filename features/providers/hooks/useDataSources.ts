import { useQuery } from "@tanstack/react-query";
import { getDataSources } from "../services/dataSources.service";
import type { DataSourceListResponse, DataSourceQueryParams } from "../types/data-sources.types";

/**
 * Hook React Query para listar fontes de dados com filtros.
 */
export function useDataSources(params?: DataSourceQueryParams, options?: { enabled?: boolean }) {
  return useQuery<DataSourceListResponse>({
    queryKey: ["data-sources", params],
    queryFn: () => getDataSources(params),
    enabled: options?.enabled,
  });
}
