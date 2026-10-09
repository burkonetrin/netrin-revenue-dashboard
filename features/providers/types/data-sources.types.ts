import type { PaginationInfo } from "@/shared/types/pagination.types";

/**
 * Define a estrutura de data source consultation type.
 */
export interface DataSourceConsultationType {
  label: string;
  value: string;
}

/**
 * Define a estrutura de data source.
 */
export interface DataSource {
  id: string;
  name: string;
  description: string;
  internalName: string;
  pathName: string[];
  consultationTypes?: Array<string | DataSourceConsultationType>;
  defaultCost?: number;
  referenceCost?: number | string | null;
  averageRealCost?: number | string | null;
  directProviders?: {
    provider: { value: string; label?: string };
    contractCost?: number | string | null;
    isDefault?: boolean;
  }[];
  hasQsaBackgroundCheck?: boolean;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Resposta da API de data source list.
 */
export interface DataSourceListResponse {
  data: DataSource[];
  pagination: PaginationInfo;
}

export interface DataSourceTemplateResponse {
  id: string;
  name: string;
  clients?: DataSourceTemplateClientResponse[];
}

export interface DataSourceTemplateClientResponse {
  id: string;
  name: string;
  deductibles?: Array<{ id: string; name: string }>;
}

export interface DataSourceTemplatesListResponse {
  data: DataSourceTemplateResponse[];
  pagination: PaginationInfo;
}

export interface DataSourceMonthFinancialsResponse {
  month: string;
  referenceCost?: string | null;
  averageRealCost?: string | null;
  averageRevenue?: string | null;
  markup?: string | null;
}

export interface DataSourceMonthlyFinancialsResponse {
  dataSource: { value: string; label: string };
  dateFrom: string;
  dateTo: string;
  months?: DataSourceMonthFinancialsResponse[];
}

/**
 * Parâmetros de consulta para data source query.
 */
export interface DataSourceQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
  providerId?: string;
  deductibleId?: string;
  dataSourceBundleId?: string;
  consultationType?: string;
}

/**
 * Payload de requisição para update data source.
 */
export interface UpdateDataSourceRequest {
  name: string;
  description: string;
  internalName: string;
  pathName: string[];
}

/**
 * Payload de requisição para patch data source active.
 */
export interface PatchDataSourceActiveRequest {
  isActive: boolean;
}

/**
 * Define a estrutura de edit source form data.
 */
export interface EditSourceFormData {
  isActive: boolean;
  name: string;
  description: string;
  internalName: string;
  pathDisplay: string;
}
