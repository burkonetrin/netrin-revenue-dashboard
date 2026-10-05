import type { PaginationInfo } from "@/shared/types/pagination.types";
import type { BillingInvoiceStatusKey, BillingInvoiceStatusMeta } from "./billing-invoice-status.types";

/**
 * Define a estrutura de billing invoice scope.
 */
export type BillingInvoiceScope = "client" | "contract" | "deductible";

/** Tipo de destino efetivo de uma nota fiscal. */
export type BillingDestinationKind = "client" | "contract_group" | "contract" | "franchise";

/** Origem usada para resolver a projeção de destino e seu vencimento. */
export type BillingDestinationSource =
  | "billing_snapshot"
  | "billing_item"
  | "nfe_metadata"
  | "payment_info_complement";

/** Projeção normalizada de um destino efetivo de nota fiscal. */
export interface BillingInvoiceDestination {
  kind: BillingDestinationKind;
  ids: string[];
  names: string[];
  dueDate?: string | null;
  source?: BillingDestinationSource;
  isManual?: boolean;
  isSeparateNfe?: boolean;
  contractId?: string;
  franchiseId?: string;
}

/**
 * Define a estrutura de billing invoice note.
 */
export interface BillingInvoiceNote {
  id: string;
  ownerName: string;
  dueDate: string;
  productName?: string;
  description?: string;
  isManual?: boolean;
  /** Contrato ao qual a nota pertence (automática) ou está vinculada (manual). */
  contractId?: string;
  /** Franquia da nota automática (scope deductible). */
  deductibleId?: string;
  /** Nota manual emitida separadamente (não agrupa com o contrato vinculado). */
  isSeparateNfe?: boolean;
  /** Destinos efetivos representados por esta nota, quando disponíveis. */
  destinations?: BillingInvoiceDestination[];
  /** Status da nota na listagem (multi-nota); fallback para status da linha. */
  billingStatus?: BillingInvoiceStatusKey;
  statusMeta?: BillingInvoiceStatusMeta;
}

/**
 * Define a estrutura de billing invoice details.
 */
export interface BillingInvoiceDetails {
  scope: BillingInvoiceScope;
  notes: BillingInvoiceNote[];
}

/**
 * Define a estrutura de billing invoice record.
 */
export interface BillingInvoiceRecord {
  id: string;
  clientId: string;
  clientName: string;
  profitCenter: string;
  profitCenterId?: string;
  competence: string;
  /** Mês de referência (YYYY-MM), independente da competência. */
  referenceMonth: string;
  /** Quantidade de meses do período de faturamento (default 1). */
  invoicePeriodMonths: number;
  totalAmount: number;
  source?: "entry" | "invoice";
  invoiceDetails: BillingInvoiceDetails;
  billingStatus?: BillingInvoiceStatusKey;
  statusMeta?: BillingInvoiceStatusMeta;
}

/**
 * Define a estrutura de billing filters.
 */
export interface BillingFilters {
  startMonth?: string;
  endMonth?: string;
  profitCenterId?: string;
  clientId?: string;
  invoiceStatus?: BillingInvoiceStatusKey;
}

/**
 * Resposta da API de billing list.
 */
export interface BillingListResponse {
  data: BillingInvoiceRecord[];
  pagination: PaginationInfo;
  totalizer?: {
    totalValue: number;
    label?: string;
  } | null;
}
