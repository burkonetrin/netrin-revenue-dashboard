import type { PaginationInfo } from "@/shared/types/pagination.types";

export const CONTACT_TYPE_VALUES = ["contract_manager", "it", "key_user", "finance"] as const;

export type ContactType = (typeof CONTACT_TYPE_VALUES)[number];

export interface Contact {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone?: string | null;
  contactType: ContactType;
  receivesNfe: boolean;
  receivesBoletos: boolean;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListContactsParams {
  page?: number;
  pageSize?: number;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc";
  search?: string | null;
  isActive?: boolean | null;
  contactType?: ContactType | null;
}

export interface PaginatedContactsResponse {
  data: Contact[];
  pagination: PaginationInfo;
}

export interface CreateContactRequest {
  name: string;
  email: string;
  contactType: ContactType;
  phone: string;
  receivesNfe?: boolean;
  receivesBoletos?: boolean;
  isActive?: boolean;
}

export interface UpdateContactRequest {
  name: string;
  email: string;
  contactType: ContactType;
  phone: string;
  receivesNfe?: boolean;
  receivesBoletos?: boolean;
}

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  contract_manager: "Gestor do contrato",
  it: "TI",
  key_user: "Key user",
  finance: "Financeiro",
};

export const CONTACT_RECEIVES_NFE_CHECKBOX_LABEL = "Recebe notas por e-mail";
export const CONTACT_RECEIVES_BOLETOS_CHECKBOX_LABEL = "Recebe boletos por e-mail";

export const CONTACT_TYPE_OPTIONS: Array<{
  value: ContactType;
  label: string;
}> = [
  { value: "contract_manager", label: CONTACT_TYPE_LABELS.contract_manager },
  { value: "it", label: CONTACT_TYPE_LABELS.it },
  { value: "finance", label: CONTACT_TYPE_LABELS.finance },
  { value: "key_user", label: CONTACT_TYPE_LABELS.key_user },
];
