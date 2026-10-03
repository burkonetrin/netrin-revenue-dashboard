import type { BillingInvoiceScope } from "./billing.types";

export type BillingAdjustmentType =
  | "discount"
  | "surcharge"
  | "due_date"
  | "competence"
  | "invoice_description";

export type BillingMonetaryTarget = "" | "contract" | "franchise";

export interface BillingAdjustmentFormState {
  adjustmentType: BillingAdjustmentType | "";
  monetaryTarget: BillingMonetaryTarget;
  contractId: string;
  franchiseId: string;
  amount: string;
  dueDate: string;
  competence: string;
  invoiceDescription: string;
  adjustmentDescription: string;
}

export interface BillingAdjustmentPayload {
  type: BillingAdjustmentType;
  contractId?: string;
  franchiseId?: string;
  amount?: number;
  dueDate?: string;
  competence?: string;
  invoiceDescription?: string;
  adjustmentDescription?: string;
}

export interface BillingAdjustmentVisibleFields {
  adjustmentType: boolean;
  monetaryTarget: boolean;
  contract: boolean;
  franchise: boolean;
  amount: boolean;
  dueDate: boolean;
  competence: boolean;
  invoiceDescription: boolean;
  adjustmentDescription: boolean;
}

export type BillingAdjustmentFieldKey = keyof BillingAdjustmentFormState;

export type BillingAdjustmentFieldErrors = Partial<
  Record<BillingAdjustmentFieldKey, string>
>;

export interface BillingAdjustmentTypeOption {
  value: BillingAdjustmentType;
  label: string;
}

export interface BillingMonetaryTargetOption {
  value: Exclude<BillingMonetaryTarget, "">;
  label: string;
}

export const MONETARY_TARGET_OPTIONS: BillingMonetaryTargetOption[] = [
  { value: "contract", label: "Contrato" },
  { value: "franchise", label: "Franquia" },
];

export function getMonetaryTargetLabel(
  adjustmentType: BillingAdjustmentType | "",
): string {
  if (adjustmentType === "surcharge") {
    return "Onde será dado o acréscimo";
  }

  return "Onde será dado o desconto";
}

export interface BillingCompetenceOption {
  value: string;
  label: string;
}

export interface BillingAdjustmentContext {
  scope: BillingInvoiceScope;
}
