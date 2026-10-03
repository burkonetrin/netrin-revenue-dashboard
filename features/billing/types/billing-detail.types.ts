import type { BillingInvoiceRecord } from "./billing.types";

/**
 * Define a estrutura de billing franchise pricing model.
 */
export type BillingFranchisePricingModel =
  | "fixed"
  | "range_per_query"
  | "range_fixed"
  | "fixed_with_range_excess";

/**
 * Define a estrutura de billing price range.
 */
export interface BillingPriceRange {
  minConsultations: number;
  maxConsultations: number | null;
  unitPrice: number;
  isFixedRange?: boolean;
  /** Faixa de excedente aberto do snapshot (`isOverage`); usada para montar a linha N+:. */
  isOverage?: boolean;
}

/**
 * Define a estrutura de billing franchise consumption.
 */
export interface BillingFranchiseConsumption {
  label: string;
  sublabel?: string;
}

/**
 * Define a estrutura de billing franchise line.
 */
export interface BillingFranchiseLine {
  id: string;
  /** UUID do item na entry/invoice (path param de email-consumption). Não confundir com `id` (deductible). */
  billingItemId: string;
  name: string;
  pricingModel: BillingFranchisePricingModel;
  fixedPrice?: number;
  priceRanges?: BillingPriceRange[];
  /** Preço unitário de excedente do snapshot (`excessUnitPrice`); ausente quando null/vazio na API. */
  excessUnitPrice?: number;
  consumption: BillingFranchiseConsumption;
  excessAmount: number;
  excessLabel?: string;
  /** Valor monetário do excedente em linha secundária (mesmo padrão de `consumption.sublabel`). */
  excessSublabel?: string;
  total: number;
  dueDate?: string;
  /**
   * Competência faturando apenas excedente (pacote já cobrado antes).
   * REQ-6/7 US 14628 — exibe tooltip no total da franquia.
   */
  isExcessOnlyBilling?: boolean;
}

export type BillingInvoiceMode = "contract" | "franchise";

/**
 * Define a estrutura de billing invoice adjustment.
 */
export interface BillingInvoiceAdjustment {
  id: string;
  type: "discount" | "surcharge";
  description: string;
  amount: number;
  /** Nome da franquia vinculada (API `deductible.label`), quando houver. */
  franchiseName?: string;
}

/**
 * Define a estrutura de billing contract detail.
 */
export interface BillingContractDetail {
  id: string;
  name: string;
  groupId?: string;
  invoiceMode?: BillingInvoiceMode;
  competence?: string;
  dueDate?: string;
  minimumValue?: number;
  /**
   * Competência faturando apenas excedente do contrato com valor mínimo
   * (derivado dos itens: todos `isOverage` com `minimumApplied` ≤ 0).
   */
  isExcessOnlyCompetence?: boolean;
  franchises: BillingFranchiseLine[];
  adjustments?: BillingInvoiceAdjustment[];
  subtotalWithoutAdjustments: number;
  total: number;
}

/**
 * Define a estrutura de billing manual invoice.
 */
export interface BillingManualInvoice {
  id: string;
  competence: string;
  description: string;
  value: number;
  dueDate: string;
  separateNote: boolean;
  contractId?: string;
  contractName?: string;
  productId: string;
  productName: string;
  profitCenter: string;
  excessProfitCenter?: string;
}

/**
 * Define a estrutura de billing invoice detail.
 */
export interface BillingInvoiceDetail extends BillingInvoiceRecord {
  description?: string;
  contracts: BillingContractDetail[];
  invoiceTotal: number;
  manualInvoices?: BillingManualInvoice[];
}
