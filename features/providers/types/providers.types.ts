import type { PaginationInfo } from "@/shared/types/pagination.types";

/** Tipo de fornecedor alinhado ao OpenAPI (`direct` | `indirect`). */
export type ProviderType = "direct" | "indirect";

/** Opção tipada retornada pela API em listagens/detalhe. */
export interface ProviderTypeOption {
  label: string;
  value: ProviderType;
}

/** Item de vínculo direto↔indireto no write (POST/PUT). */
export interface ProviderUsageItemRequest {
  providerId: string;
  dataSourceIds: string[];
}

/** Body do POST /v1/providers — required: name, providerType, isPrepaid. */
export interface CreateProviderRequest {
  name: string;
  providerType: ProviderType;
  isPrepaid: boolean;
  description?: string | null;
  isActive?: boolean;
  dataSourceIds?: string[];
  providerUsages?: ProviderUsageItemRequest[];
}

/** Body do PUT /v1/providers/{id} — sem providerType/isPrepaid. */
export interface UpdateProviderRequest {
  name: string;
  description?: string | null;
  dataSourceIds?: string[];
  providerUsages?: ProviderUsageItemRequest[];
}

/** Fonte vinculada ao detalhe GET (`ProviderDataSourceResponse` OpenAPI). */
export interface ProviderDataSource {
  id: string;
  name: string;
  internalName: string;
  /** Decimal serializado pela API (string). */
  defaultCost: string;
}

/**
 * Uso entre providers no detalhe GET (`ProviderUsageInfoResponse` OpenAPI).
 * Write continua em `ProviderUsageItemRequest`.
 */
export interface ProviderUsageInfo {
  id: string;
  name: string;
  providerType: ProviderTypeOption;
  dataSources: ProviderDataSource[];
}

/**
 * Item de listagem / resposta base de provider (ProviderResponse OpenAPI).
 */
export interface ProviderResponse {
  id: string;
  name: string;
  description?: string | null;
  isPrepaid: boolean;
  isActive: boolean;
  isArchived?: boolean;
  providerType: ProviderTypeOption;
  createdAt?: string;
  updatedAt?: string;
}

/** Alias de listagem — mesmo contrato ProviderResponse. */
export type Provider = ProviderResponse;

/** Detalhe GET de fornecedor direto. */
export interface GetDirectProviderResponse extends ProviderResponse {
  dataSources: ProviderDataSource[];
  providerUsages: ProviderUsageInfo[];
}

/** Detalhe GET de fornecedor indireto. */
export interface GetIndirectProviderResponse extends ProviderResponse {
  providerUsages: ProviderUsageInfo[];
}

export type ProviderDetail = GetDirectProviderResponse | GetIndirectProviderResponse;

/**
 * Resposta da API de provider list.
 */
export interface ProviderListResponse {
  data: Provider[];
  pagination: PaginationInfo;
}

/**
 * Parâmetros de consulta para providers query.
 */
export interface ProvidersQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc";
  search?: string | null;
  name?: string | null;
  providerType?: ProviderType | null;
  isActive?: boolean | null;
  dataSourceId?: string | null;
}

/**
 * Estado de formulário create/edit (UI) — mappers em providerForm.utils.
 */
export interface ProviderFormState {
  name: string;
  isPrepaid: boolean;
  providerType: ProviderType | "";
  /** Indireto → API description */
  service: string;
  /** Direto */
  linkedSources: { id: string; name: string; defaultCost: string }[];
  usesIndirectProviders: boolean;
  /** providerId → dataSourceIds selecionados */
  usagesByProviderId: Record<string, string[]>;
  /** Indireto */
  usedByDirectProviders: boolean;
}
