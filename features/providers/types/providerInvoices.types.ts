import type { PaginationInfo } from "@/shared/types/pagination.types";
import type { ProviderTypeOption } from "./providers.types";

/** Depósito de crédito em competência pré-paga (OpenAPI). */
export interface ProviderCreditDeposit {
  id: string;
  paidAt?: string | null;
  creditedAt?: string | null;
  balanceBeforeCredit: string;
  creditAmount: string;
  balanceAfterCredit: string;
  consumedValue: string;
}

/** Fonte retornada pela consulta de fontes bilhetáveis (OpenAPI). */
export interface ProviderInvoiceBillableSourceResponse {
  directProviderId: string;
  directProviderName: string;
  dataSourceProviderId: string;
  dataSourceName: string;
  dataSourceInternalName: string;
  clientBillableQuantity: number;
}

/** Fonte congelada no snapshot da fatura (OpenAPI). */
export interface ProviderInvoiceSourceResponse extends ProviderInvoiceBillableSourceResponse {
  id: string;
  providerChargedQuantity: number | null;
  unitCost: string;
  totalCost: string;
  origin: string;
}

/** Compatibilidade nominal para consumidores existentes da resposta de fatura. */
export type ProviderInvoiceSource = ProviderInvoiceSourceResponse;

/** Decimal aceito pelo OpenAPI nos requests de fatura. */
export type ProviderInvoiceDecimal = number | string;

/** Depósito enviado no cadastro de uma competência pré-paga (OpenAPI). */
export interface CreateProviderCreditDepositRequest {
  balanceBeforeCredit: ProviderInvoiceDecimal;
  creditAmount: ProviderInvoiceDecimal;
  paidAt?: string | null;
  creditedAt?: string | null;
}

/** Depósito persistido enviado ao atualizar uma competência pré-paga. */
export interface EditProviderCreditDepositRequest extends CreateProviderCreditDepositRequest {
  id: string;
}

/** Body do POST de depósito ou fechamento de competência pré-paga (OpenAPI). */
export interface UpdateProviderCreditDepositRequest {
  balanceBeforeCredit?: ProviderInvoiceDecimal | null;
  creditAmount?: ProviderInvoiceDecimal | null;
  paidAt?: string | null;
  creditedAt?: string | null;
  endingBalance?: ProviderInvoiceDecimal | null;
  isMonthClosed?: boolean;
}

/** Body do POST `/v1/providers/{provider_id}/invoice-competences` (OpenAPI). */
export interface CreateProviderInvoiceCompetenceRequest {
  competenceMonth: string;
  assessmentStartDate: string;
  assessmentEndDate: string;
  startingBalance: ProviderInvoiceDecimal;
  creditDeposits?: CreateProviderCreditDepositRequest[];
  endingBalance?: ProviderInvoiceDecimal | null;
  isMonthClosed?: boolean;
  minimumFranchiseValue?: ProviderInvoiceDecimal | null;
  invoiceFileUrl?: string | null;
  sources?: CreateProviderInvoiceSourceRequest[];
}

/** Body do PATCH `/v1/providers/{provider_id}/invoice-competences/{invoice_id}` (OpenAPI). */
export interface UpdateProviderInvoiceCompetenceRequest {
  competenceMonth: string;
  assessmentStartDate: string;
  assessmentEndDate: string;
  startingBalance: ProviderInvoiceDecimal;
  minimumFranchiseValue?: ProviderInvoiceDecimal | null;
  invoiceFileUrl?: string | null;
  sources?: CreateProviderInvoiceSourceRequest[];
  creditDeposits?: EditProviderCreditDepositRequest[] | null;
}

/** Fonte enviada no cadastro de uma fatura (OpenAPI). */
export interface CreateProviderInvoiceSourceRequest {
  dataSourceProviderId: string;
  providerChargedQuantity?: number | null;
  unitCost?: ProviderInvoiceDecimal | null;
  totalCost?: ProviderInvoiceDecimal | null;
}

/** Body do POST `/v1/providers/{provider_id}/invoices` (OpenAPI). */
export interface CreateProviderInvoiceRequest {
  competenceMonth: string;
  assessmentStartDate: string;
  assessmentEndDate: string;
  invoiceTotalValue?: ProviderInvoiceDecimal | null;
  minimumFranchiseValue?: ProviderInvoiceDecimal | null;
  invoiceFileUrl?: string | null;
  sources?: CreateProviderInvoiceSourceRequest[];
}

/** Body do PATCH `/v1/providers/{provider_id}/invoices/{invoice_id}` (OpenAPI). */
export interface UpdateProviderInvoiceRequest {
  competenceMonth: string;
  assessmentStartDate: string;
  assessmentEndDate: string;
  invoiceTotalValue?: ProviderInvoiceDecimal | null;
  minimumFranchiseValue?: ProviderInvoiceDecimal | null;
  invoiceFileUrl?: string | null;
  sources?: CreateProviderInvoiceSourceRequest[];
}

/** Resposta do upload opcional da fatura (OpenAPI). */
export interface ProviderInvoiceFileUploadResponse {
  invoiceFileUrl: string;
}

/**
 * Resposta de fatura/competência de fornecedor (`ProviderInvoiceResponse` OpenAPI).
 * Campos usados na UI desta entrega destacados nos comentários.
 */
export interface ProviderInvoiceResponse {
  id: string;
  providerId: string;
  providerName: string;
  providerType: ProviderTypeOption;
  isPrepaid: boolean;
  /** Coluna Competência */
  competenceMonth: string;
  assessmentStartDate: string;
  assessmentEndDate: string;
  /** Coluna Valor (pós-pago) */
  invoiceTotalValue: string;
  minimumFranchiseValue?: string | null;
  invoiceFileUrl?: string | null;
  startingBalance?: string | null;
  /** Coluna Valor acumulado (pré-pago) */
  endingBalance?: string | null;
  isMonthClosed?: boolean;
  /** Ausente em registros legados; somente `true` habilita edição no frontend. */
  isOpen?: boolean;
  sourcesTotalValue: string;
  isActive: boolean;
  isArchived: boolean;
  sources: ProviderInvoiceSourceResponse[];
  /** Usado para Último depósito de crédito */
  creditDeposits?: ProviderCreditDeposit[];
  createdAt: string;
  updatedAt: string;
}

export interface ProviderInvoiceListResponse {
  data: ProviderInvoiceResponse[];
  pagination: PaginationInfo;
}

export interface ProviderInvoicesQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc";
  search?: string | null;
}
