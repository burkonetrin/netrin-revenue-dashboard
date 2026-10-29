import { useQuery } from "@tanstack/react-query";
import { getDataSourceMonthlyFinancials } from "../services/dataSources.service";
import type { DataSourceMonthlyFinancialsResponse } from "../types/data-sources.types";

export function useDataSourceMonthlyFinancials(
  dataSourceId: string,
  dateFrom: string,
  dateTo: string,
) {
  return useQuery<DataSourceMonthlyFinancialsResponse>({
    queryKey: ["data-source-monthly-financials", dataSourceId, dateFrom, dateTo],
    queryFn: () => getDataSourceMonthlyFinancials(dataSourceId, dateFrom, dateTo),
    enabled: Boolean(dataSourceId && dateFrom && dateTo),
  });
}
