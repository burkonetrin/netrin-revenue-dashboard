import { useQuery } from "@tanstack/react-query";
import { getDataSourceTemplates } from "../services/dataSources.service";
import type { DataSourceTemplatesListResponse } from "../types/data-sources.types";

export function useDataSourceTemplates(dataSourceId: string | null) {
  return useQuery<DataSourceTemplatesListResponse>({
    queryKey: ["data-source-templates", dataSourceId],
    queryFn: () => {
      if (!dataSourceId) throw new Error("Data source id is required");
      return getDataSourceTemplates(dataSourceId);
    },
    enabled: Boolean(dataSourceId),
  });
}
