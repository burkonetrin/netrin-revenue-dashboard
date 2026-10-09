import type { PaginationInfo } from "@/shared/types/pagination.types";

/**
 * Define a estrutura de data source bundle.
 */
export interface DataSourceBundle {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  isArchived: boolean;
  dataSourceCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Define a estrutura de data source bundle product.
 */
export interface DataSourceBundleProduct {
  id: string;
  name: string;
}

/**
 * Define a estrutura de data source bundle summary.
 */
export interface DataSourceBundleSummary {
  id: string;
  name: string;
  internalName: string;
}

/**
 * Define a estrutura de data source bundle detail.
 */
export interface DataSourceBundleDetail extends DataSourceBundle {
  dataSources: DataSourceBundleSummary[];
  products: DataSourceBundleProduct[];
}

/** Referência { value, label } retornada pelo contrato de grupos de fontes. */
export interface DataSourceBundleProviderRefResponse {
  value: string;
  label?: string;
}

/** Produto no contrato de resposta de grupos de fontes. */
export interface DataSourceBundleProductResponse {
  value: string;
  label?: string;
}

/** Fonte e fornecedores retornados no detalhe/listagem de um grupo. */
export interface DataSourceBundleDataSourceResponse {
  id: string;
  name: string;
  internalName: string;
  isActive?: boolean;
  providers?: DataSourceBundleProviderRefResponse[];
  defaultProvider?: DataSourceBundleProviderRefResponse | null;
  selectedProvider?: DataSourceBundleProviderRefResponse | null;
}

/** Valor decimal serializado pela API como número ou string, ou ausente/nulo. */
export type DataSourceBundleCostResponse = number | string | null;

/** Resposta do OpenAPI para listagem, detalhe e mutações de grupo. */
export interface DataSourceBundleResponse extends DataSourceBundle {
  dataSources?: DataSourceBundleDataSourceResponse[];
  products?: DataSourceBundleProductResponse[];
  standardCost?: DataSourceBundleCostResponse;
  actualCost?: DataSourceBundleCostResponse;
}

export type DataSourceBundleApiDetailResponse = DataSourceBundleResponse;

/** Payloads de escrita conforme os schemas do OpenAPI. */
export interface CreateDataSourceBundleApiRequest {
  name: string;
  isActive?: boolean;
  productIds?: string[];
}

export interface UpdateDataSourceBundleApiRequest {
  name: string;
  productIds?: string[];
}

export interface AssignDataSourceIdsApiRequest {
  dataSourceIds: string[];
  providerId?: string | null;
}

/**
 * Resposta da API de data source bundle list.
 */
export interface DataSourceBundleListResponse {
  data: DataSourceBundleResponse[];
  pagination: PaginationInfo;
}

/**
 * Parâmetros de consulta para data source bundle query.
 */
export interface DataSourceBundleQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
  productId?: string;
  dataSourceId?: string;
}

/**
 * Payload de requisição para create data source bundle.
 */
export interface CreateDataSourceBundleRequest {
  name: string;
  description: string;
  isActive: boolean;
  productIds: string[];
}

/**
 * Payload de requisição para update data source bundle.
 */
export interface UpdateDataSourceBundleRequest {
  name: string;
  description: string;
  productIds: string[];
}

/**
 * Payload de requisição para patch data source bundle active.
 */
export interface PatchDataSourceBundleActiveRequest {
  isActive: boolean;
}

/**
 * Payload de requisição para assign data source ids.
 */
export interface AssignDataSourceIdsRequest {
  dataSourceIds: string[];
}

/**
 * Payload de requisição para remove data source ids.
 */
export interface RemoveDataSourceIdsRequest {
  dataSourceIds: string[];
}

/**
 * Define a estrutura de source group form source.
 */
export interface SourceGroupFormSource {
  id: string;
  name: string;
  referenceCost: number;
  realCost: number;
}

/**
 * Define a estrutura de source group form data.
 */
export interface SourceGroupFormData {
  isActive: boolean;
  name: string;
  productIds: string[];
  selectedSources: SourceGroupFormSource[];
}

/**
 * Define a estrutura de source group form snapshot.
 */
export interface SourceGroupFormSnapshot {
  isActive: boolean;
  dataSourceIds: string[];
}

/**
 * Franquia (deductible) vinculada a um cliente que usa o grupo de fontes.
 */
export interface BundleLinkedFranchise {
  id: string;
  name: string;
}

/**
 * Cliente vinculado a um grupo de fontes com suas franquias.
 */
export interface BundleLinkedClient {
  id: string;
  name: string;
  deductibles: BundleLinkedFranchise[];
}

/**
 * Parâmetros de paginação da listagem de clientes vinculados ao grupo de fontes.
 */
export interface ListBundleLinkedClientsParams {
  page?: number;
  pageSize?: number;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
  search?: string | null;
}

/**
 * Resposta paginada de clientes vinculados a um grupo de fontes.
 */
export interface PaginatedBundleLinkedClientsResponse {
  data: BundleLinkedClient[];
  pagination: PaginationInfo;
}
