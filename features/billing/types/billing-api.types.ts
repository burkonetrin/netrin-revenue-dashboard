import type { PaginationInfo } from "@/shared/types/pagination.types";

export interface ApiEntityRef {
  value: string;
  label?: string;
}

export interface ApiMonthRef {
  year: number;
  month: number;
}

export type ApiMonthValue = ApiMonthRef | string | null | undefined;

export interface ApiNfeMetadataItem {
  id?: string;
  type?: string;
  label?: string;
  names?: string[];
  contractIds?: string[];
  ownerName?: string;
  owner_name?: string;
  dueDate?: string;
  due_date?: string;
  productName?: string;
  description?: string;
  contractId?: string;
  /** Campo legado ainda retornado por algumas respostas de metadata. */
  contract_id?: string;
  franchiseId?: string;
  franchise_id?: string;
  deductibleId?: string;
  deductible_id?: string;
  deductible?: ApiEntityRef | null;
  isManual?: boolean;
  isSeparateNfe?: boolean;
}

export interface ApiPricingRange {
  minConsultations?: number;
  maxConsultations?: number | null;
  unitPrice?: string;
  isOverage?: boolean;
  min_consultations?: number;
  max_consultations?: number | null;
  unit_price?: string;
  is_overage?: boolean;
}

export interface ApiBillingItemBase {
  id: string;
  deductible?: ApiEntityRef | null;
  contract?: ApiEntityRef | null;
  packageValue: string;
  overageValue: string;
  value: string;
  consultationQuantity: number;
  competenceMonth?: ApiMonthValue;
  dueDate?: string | null;
  billingModel?: string | null;
  pricingRanges?: ApiPricingRange[] | null;
  includedConsultations?: number | null;
  packagePrice?: string | null;
  excessUnitPrice?: string | null;
  contractNfeMode?: string | null;
  contractGroupId?: string | null;
  groupContractNames?: string[];
  /**
   * Item de fatura de excedente (separado do item de pacote).
   * Diferente de `pricingRanges[].isOverage` (legado nas faixas).
   */
  isOverage?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiInvoiceItemResponse extends ApiBillingItemBase {
  isManual?: boolean;
  isSeparateNfe?: boolean;
  product?: ApiEntityRef | null;
  profitCenter?: ApiEntityRef | null;
  overageProfitCenter?: ApiEntityRef | null;
  description?: string | null;
}

export interface ApiBillingEntryItemResponse extends ApiBillingItemBase {
  calculatedValue: string;
  isManual?: boolean;
  isSeparateNfe?: boolean;
  /**
   * Valor mínimo do contrato aplicado neste item na competência (OpenAPI v0.0.77).
   * Ausente em invoice items — tratar como `"0.00"`.
   */
  minimumApplied?: string;
  product?: ApiEntityRef | null;
  profitCenter?: ApiEntityRef | null;
  overageProfitCenter?: ApiEntityRef | null;
  description?: string | null;
}

export type ApiBillingAdjustmentType =
  | "discount"
  | "surcharge"
  | "due_date"
  | "competence"
  | "description";

export interface ApiBillingEntryAdjustmentRequest {
  type: ApiBillingAdjustmentType;
  amount?: string | null;
  description?: string | null;
  dueDate?: string | null;
  competenceMonth?: string | null;
  billingEntryDescription?: string | null;
  contractId?: string | null;
  deductibleId?: string | null;
}

/** Campos comuns de diff de ajuste (entry e invoice). */
interface ApiAdjustmentDiffFields {
  contract?: ApiEntityRef | null;
  deductible?: ApiEntityRef | null;
  previousTotalValue?: string | null;
  newTotalValue?: string | null;
  previousDueDate?: string | null;
  newDueDate?: string | null;
  previousCompetenceMonth?: ApiMonthValue;
  newCompetenceMonth?: ApiMonthValue;
  previousDescription?: string | null;
  newDescription?: string | null;
}

export interface ApiBillingEntryAdjustmentResponse extends ApiAdjustmentDiffFields {
  id: string;
  type: string;
  amount?: string | null;
  description: string;
  author?: ApiEntityRef | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiInvoiceAdjustmentResponse extends ApiAdjustmentDiffFields {
  id: string;
  type: string;
  amount?: string | null;
  description: string;
  authorId?: string;
  createdAt?: string;
}

export interface ApiInvoiceResponse {
  id: string;
  client: ApiEntityRef;
  contract?: ApiEntityRef | null;
  deductible?: ApiEntityRef | null;
  nfeUnificationLevel: string;
  referenceMonth: ApiMonthValue;
  competenceMonth?: ApiMonthValue;
  dueDate?: string | null;
  totalValue: string;
  status?: string;
  description?: string | null;
  isManual?: boolean;
  isSeparateNfe?: boolean;
  invoicePeriodMonths?: number;
  contractMinimumValue?: string | null;
  product?: ApiEntityRef | null;
  profitCenter?: ApiEntityRef | null;
  overageProfitCenter?: ApiEntityRef | null;
  nfeMetadata?: ApiNfeMetadataItem[] | null;
  manualInvoices?: ApiInvoiceResponse[] | null;
  items?: ApiInvoiceItemResponse[];
  adjustments?: ApiInvoiceAdjustmentResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiInvoiceTotalizer {
  totalValue: string;
  label?: string;
}

export interface ApiInvoiceListResponse {
  data: ApiInvoiceResponse[];
  pagination: PaginationInfo;
  totalizer?: ApiInvoiceTotalizer | null;
}

export interface ApiBillingEntryResponse {
  id: string;
  client: ApiEntityRef;
  contract?: ApiEntityRef | null;
  deductible?: ApiEntityRef | null;
  nfeUnificationLevel: string;
  referenceMonth: ApiMonthValue;
  competenceMonth?: ApiMonthValue;
  dueDate?: string | null;
  contractMinimumValue?: string | number | null;
  description?: string | null;
  totalValue: string;
  isArchived?: boolean;
  isSeparateNfe?: boolean;
  invoicePeriodMonths?: number;
  profitCenter?: ApiEntityRef | null;
  nfeMetadata?: ApiNfeMetadataItem[] | null;
  manualInvoices?: ApiInvoiceResponse[] | null;
  items?: ApiBillingEntryItemResponse[];
  adjustments?: ApiBillingEntryAdjustmentResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiCreateManualInvoiceRequest {
  clientId: string;
  competenceMonth: string;
  totalValue: number | string;
  profitCenterId: string;
  overageProfitCenterId?: string | null;
  productId: string;
  description: string;
  isSeparateNfe: boolean;
  dueDate?: string | null;
  contractId?: string | null;
}

export interface ListInvoicesParams {
  referenceMonth?: string;
  clientId?: string;
  profitCenterId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export type ApiBillingAllItemType = "billing_entry" | "invoice" | string;

/** Item unificado retornado por GET /v1/billing/all (formato atual da API). */
export interface ApiBillingAllListItem extends ApiBillingEntryResponse {
  itemType?: ApiBillingAllItemType;
  status?: string | null;
  contractMinimumValue?: string | number | null;
}

export interface ApiBillingAllResponse {
  /** Formato legado: arrays separados. */
  entries?: ApiBillingEntryResponse[];
  invoices?: ApiInvoiceResponse[];
  /** Formato atual: lista unificada com itemType. */
  data?: ApiBillingAllListItem[];
  pagination: PaginationInfo;
  totalizer?: ApiInvoiceTotalizer | null;
}

export interface ListBillingAllParams {
  clientId?: string;
  profitCenterId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
