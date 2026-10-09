import type {
  AssignDataSourceIdsApiRequest,
  CreateDataSourceBundleApiRequest,
  DataSourceBundle,
  DataSourceBundleApiDetailResponse,
  DataSourceBundleListResponse,
  DataSourceBundleQueryParams,
  ListBundleLinkedClientsParams,
  PaginatedBundleLinkedClientsResponse,
  PatchDataSourceBundleActiveRequest,
  RemoveDataSourceIdsRequest,
  UpdateDataSourceBundleApiRequest,
} from "../types/data-source-bundles.types";
import * as mock from "../mock/providersMockStore";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDataSourceBundles(
  params: DataSourceBundleQueryParams = {},
): Promise<DataSourceBundleListResponse> {
  await delay();
  return mock.mockListDataSourceBundles(params);
}

export async function getDataSourceBundleById(
  id: string,
): Promise<DataSourceBundleApiDetailResponse> {
  await delay();
  return mock.mockGetDataSourceBundleById(id);
}

export async function createDataSourceBundle(
  data: CreateDataSourceBundleApiRequest,
): Promise<DataSourceBundle> {
  await delay();
  return mock.mockCreateDataSourceBundle(data);
}

export async function updateDataSourceBundle(
  id: string,
  data: UpdateDataSourceBundleApiRequest,
): Promise<DataSourceBundle> {
  await delay();
  return mock.mockUpdateDataSourceBundle(id, data);
}

export async function patchDataSourceBundleActive(
  id: string,
  data: PatchDataSourceBundleActiveRequest,
): Promise<DataSourceBundle> {
  await delay();
  return mock.mockPatchDataSourceBundleActive(id, data);
}

export async function deleteDataSourceBundle(id: string): Promise<void> {
  await delay();
  mock.mockDeleteDataSourceBundle(id);
}

export async function assignBundleDataSources(
  id: string,
  data: AssignDataSourceIdsApiRequest,
): Promise<number> {
  await delay();
  return mock.mockAssignBundleDataSources(id, data);
}

export async function removeBundleDataSources(
  id: string,
  data: RemoveDataSourceIdsRequest,
): Promise<number> {
  await delay();
  return mock.mockRemoveBundleDataSources(id, data);
}

export async function getBundleLinkedClients(
  bundleId: string,
  params?: ListBundleLinkedClientsParams,
): Promise<PaginatedBundleLinkedClientsResponse> {
  await delay();
  return mock.mockGetBundleLinkedClients(bundleId, params);
}
