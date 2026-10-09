import type { PaginationInfo } from "@/shared/types/pagination.types";

export interface BackgroundCheckTemplateOption {
  label: string;
  value: string;
}

export interface BackgroundCheckTemplate {
  id: string;
  name: string;
  description?: string;
  queryType?: string;
  query_type?: string;
  consultationType?: string | BackgroundCheckTemplateOption;
  consultation_type?: string | BackgroundCheckTemplateOption;
  sources?: number;
  sourcesCount?: number;
  sources_count?: number;
  cost?: number | string;
  clients?: number;
  clientsCount?: number;
  clients_count?: number;
  commercialUse?: string;
  commercial_use?: string;
  commercialName?: string;
  commercial_name?: string;
  isActive?: boolean;
  is_active?: boolean;
  hasQsaBackgroundCheck?: boolean;
  has_qsa_background_check?: boolean;
  referenceCost?: number | null;
  actualCost?: number | null;
  linkedDataSources?: Array<{ id: string; name: string; isActive?: boolean }>;
}

export interface ListBackgroundCheckTemplatesParams {
  page?: number;
  limit?: number;
  pageSize?: number;
  search?: string | null;
  consultationType?: string | null;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
}

export interface PaginatedBackgroundCheckTemplatesResponse {
  data: BackgroundCheckTemplate[];
  pagination: PaginationInfo;
}

export interface CreateBackgroundCheckTemplateRequest {
  name: string;
  description?: string;
  commercialName?: string;
  consultationType: "br-person" | "br-entity" | "intl-entity";
  isActive?: boolean;
}

/** Body do PUT /background-check-templates/{id} — alinhado ao OpenAPI (sem isActive). */
export interface UpdateBackgroundCheckTemplateRequest {
  name: string;
  description?: string;
  commercialName: string;
  consultationType: "br-person" | "br-entity" | "intl-entity";
  hasQsaBackgroundCheck?: boolean;
}

export interface AssignBackgroundCheckTemplateDataSourcesRequest {
  templateId: string;
  dataSourceIds: string[];
}

export interface AssignBackgroundCheckTemplateToDeductibleRequest {
  deductibleId: string;
  backgroundCheckTemplateIds: string[];
}

export interface BackgroundCheckTemplateDataSourceOption {
  value: string;
  label: string;
  internalName?: string;
  hasQsaBackgroundCheck?: boolean;
}
