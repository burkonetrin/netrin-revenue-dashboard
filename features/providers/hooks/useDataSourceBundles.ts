import { useQuery } from "@tanstack/react-query";
import { getDataSourceBundles } from "../services/dataSourceBundles.service";
import type {
  DataSourceBundleListResponse,
  DataSourceBundleQueryParams,
} from "../types/data-source-bundles.types";

/**
 * Hook React Query para listar bundles de fontes de dados.
 */
export function useDataSourceBundles(params?: DataSourceBundleQueryParams) {
  return useQuery<DataSourceBundleListResponse>({
    queryKey: ["data-source-bundles", params],
    queryFn: () => getDataSourceBundles(params),
  });
}
