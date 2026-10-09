import type { PaginationInfo } from "@/shared/types/pagination.types";

/**
 * CORRECOES-GABRIEL.md (linhas 339-350)
 */
export interface Source {
  id: number;
  status: boolean;
  name: string;
  description: string;
  internalName: string;
  creditValue?: number;
  mongoId?: string;
  path?: string[];
  providers?: Provider[];
}

export interface Provider {
  id?: string;
  companyName: string;
  cnpj: string;
}

export interface SourceFormData {
  status: boolean;
  name: string;
  description: string;
  internalName: string;
  creditValue: string;
  mongoId?: string;
  path?: string;
  providers: Provider[];
}

export interface AboutSourceFormProps {
  formData: SourceFormData;
  onFormDataChange: (data: SourceFormData) => void;
}

export interface ProviderSourceFormProps {
  formData: SourceFormData;
  onFormDataChange: (data: SourceFormData) => void;
}

export interface SourceFormProps {
  formData: SourceFormData;
  onFormDataChange: (data: SourceFormData) => void;
}

/**
 * CORRECOES-GABRIEL.md (linhas 372-378, 405)
 */
export interface SourceListResponse {
  data: Source[];
  pagination: PaginationInfo;
}
