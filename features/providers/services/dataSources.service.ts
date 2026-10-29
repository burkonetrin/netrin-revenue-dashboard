import type {
  DataSource,
  DataSourceListResponse,
  DataSourceMonthlyFinancialsResponse,
  DataSourceQueryParams,
  DataSourceTemplatesListResponse,
  PatchDataSourceActiveRequest,
  UpdateDataSourceRequest,
} from "../types/data-sources.types";
import * as mock from "../mock/providersMockStore";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDataSources(
  params: DataSourceQueryParams = {},
): Promise<DataSourceListResponse> {
  await delay();
  return mock.mockListDataSources(params);
}

export async function getDataSourceById(id: string): Promise<DataSource> {
  await delay();
  return mock.mockGetDataSourceById(id);
}

export async function getDataSourceTemplates(
  dataSourceId: string,
): Promise<DataSourceTemplatesListResponse> {
  await delay();
  return mock.mockGetDataSourceTemplates(dataSourceId);
}

export async function getDataSourceMonthlyFinancials(
  dataSourceId: string,
  dateFrom: string,
  dateTo: string,
): Promise<DataSourceMonthlyFinancialsResponse> {
  await delay();
  return mock.mockGetDataSourceMonthlyFinancials(dataSourceId, dateFrom, dateTo);
}

export async function updateDataSource(
  id: string,
  data: UpdateDataSourceRequest,
): Promise<DataSource> {
  await delay();
  return mock.mockUpdateDataSource(id, data);
}

export async function patchDataSourceActive(
  id: string,
  data: PatchDataSourceActiveRequest,
): Promise<DataSource> {
  await delay();
  return mock.mockPatchDataSourceActive(id, data);
}
