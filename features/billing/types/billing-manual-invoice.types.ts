import type { ClientNfeUnificationLevel } from "@/features/clients/types/clients.types";
import type { BillingManualInvoice } from "./billing-detail.types";
import type { BillingInvoiceScope } from "./billing.types";

/**
 * Define a estrutura de billing manual invoice client option.
 */
export interface BillingManualInvoiceClientOption {
  id: string;
  name: string;
  nfeUnificationLevel: ClientNfeUnificationLevel;
}

/**
 * Define a estrutura de billing manual invoice contract option.
 */
export interface BillingManualInvoiceContractOption {
  id: string;
  clientId: string;
  name: string;
}

/**
 * Define a estrutura de billing manual invoice product option.
 */
export interface BillingManualInvoiceProductOption {
  id: string;
  name: string;
}

/**
 * Estado do billing manual invoice form.
 */
export interface BillingManualInvoiceFormState {
  clientId: string;
  competence: string;
  amount: string;
  profitCenter: string;
  excessProfitCenter: string;
  productId: string;
  description: string;
  separateNote: boolean;
  dueDateFull: string;
  contractId: string;
}

/**
 * Define a estrutura de billing manual invoice field errors.
 */
export interface BillingManualInvoiceFieldErrors {
  clientId?: string;
  competence?: string;
  amount?: string;
  profitCenter?: string;
  productId?: string;
  description?: string;
  dueDateFull?: string;
  contractId?: string;
}

/**
 * Payload de envio para billing manual invoice.
 */
export interface BillingManualInvoicePayload {
  clientId: string;
  clientName: string;
  competence: string;
  amount: number;
  profitCenter: string;
  excessProfitCenter?: string;
  productId: string;
  productName: string;
  description: string;
  separateNote: boolean;
  dueDate: string;
  contractId?: string;
  contractName?: string;
  scope: BillingInvoiceScope;
}

export interface ManualInvoicePayloadContext {
  clientId: string;
  clientName: string;
  nfeUnificationLevel: ClientNfeUnificationLevel;
  hasPresetClient: boolean;
  productId: string;
  productName: string;
  contracts: BillingManualInvoiceContractOption[];
  /** Vencimento da nota unificada (mesma nota), já exibido no drawer. */
  unifiedDueDate?: string;
}

/**
 * Define a estrutura de create manual invoice result.
 */
export interface CreateManualInvoiceResult {
  manualInvoice: BillingManualInvoice;
}

/**
 * Define a estrutura de billing manual invoice visible fields.
 */
export interface BillingManualInvoiceVisibleFields {
  client: boolean;
  separateNoteCheckbox: boolean;
  contract: boolean;
  dueDateFull: boolean;
}
