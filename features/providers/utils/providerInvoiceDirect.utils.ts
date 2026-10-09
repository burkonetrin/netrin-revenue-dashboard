import type {
  CreateProviderInvoiceRequest,
  ProviderInvoiceBillableSourceResponse,
} from "../types/providerInvoices.types";
import {
  type ProviderInvoiceFormErrors,
  validateAndNormalizeProviderInvoiceForm,
} from "./providerInvoiceForm.utils";

export interface ProviderInvoiceDirectSource extends ProviderInvoiceBillableSourceResponse {
  providerChargedQuantity: number | null;
  unitCost: string;
  totalCost: string;
}

export interface ProviderInvoiceDirectTotals {
  totalBillableQuantity: number;
  sourcesTotalValue: string;
  franchiseExcedentValue: string;
  invoiceTotalValue: string;
}

export interface DirectPostpaidInvoiceFormInput {
  competenceMonth: string;
  assessmentStartDate: string;
  assessmentEndDate: string;
  minimumFranchiseValue?: string;
  invoiceFile?: File | null;
  sources: ProviderInvoiceDirectSource[];
  usedCompetenceMonths: string[];
}

export type DirectPostpaidInvoiceFormErrors = ProviderInvoiceFormErrors & {
  sources?: string;
  competenceMonth?: string;
};

export type DirectPostpaidInvoiceFormValidation =
  | {
      valid: true;
      value: { payload: CreateProviderInvoiceRequest; invoiceFile: File | null };
      errors: Record<string, never>;
    }
  | { valid: false; value: null; errors: DirectPostpaidInvoiceFormErrors };

function toCents(value: number | string | null | undefined): number {
  return Math.round(Number(value ?? 0) * 100);
}

function fromCents(value: number): string {
  return (value / 100).toFixed(2);
}

function getQuantity(source: ProviderInvoiceDirectSource): number {
  return Math.max(0, source.clientBillableQuantity);
}

function normalizedSourceCost(source: ProviderInvoiceDirectSource, value: string): string | null {
  const normalized = normalizeOptionalMoney(value);
  return normalized ?? (getQuantity(source) === 0 ? "0.00" : null);
}

function normalizeOptionalMoney(value: string): string | null {
  const trimmed = value.trim().replace(/^R\$\s?/, "");
  if (!trimmed || trimmed.startsWith("-")) return null;

  const normalized = trimmed.includes(",") ? trimmed.replace(/\./g, "").replace(",", ".") : trimmed;
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? fromCents(toCents(parsed)) : null;
}

export function updateDirectInvoiceSource(
  source: ProviderInvoiceDirectSource,
  field: "unitCost" | "totalCost",
  value: number | string,
): ProviderInvoiceDirectSource {
  const valueInCents = toCents(value);
  const quantity = getQuantity(source);

  if (field === "totalCost") {
    return {
      ...source,
      totalCost: fromCents(valueInCents),
      unitCost: quantity > 0 ? fromCents(Math.round(valueInCents / quantity)) : source.unitCost,
    };
  }

  return {
    ...source,
    unitCost: fromCents(valueInCents),
    totalCost: quantity > 0 ? fromCents(valueInCents * quantity) : source.totalCost,
  };
}

export function getDirectInvoiceTotals(
  sources: ProviderInvoiceDirectSource[],
  minimumFranchiseValue?: number | string | null,
): ProviderInvoiceDirectTotals {
  const sourcesTotalInCents = sources.reduce(
    (total, source) => total + toCents(source.totalCost),
    0,
  );
  const franchiseInCents = toCents(minimumFranchiseValue);
  const invoiceTotalInCents = Math.max(sourcesTotalInCents, franchiseInCents);

  return {
    totalBillableQuantity: sources.reduce((total, source) => total + getQuantity(source), 0),
    sourcesTotalValue: fromCents(sourcesTotalInCents),
    franchiseExcedentValue: fromCents(Math.max(sourcesTotalInCents - franchiseInCents, 0)),
    invoiceTotalValue: fromCents(invoiceTotalInCents),
  };
}

export function validateDirectPostpaidInvoiceForm(
  input: DirectPostpaidInvoiceFormInput,
): DirectPostpaidInvoiceFormValidation {
  const totals = getDirectInvoiceTotals(input.sources, input.minimumFranchiseValue);
  const common = validateAndNormalizeProviderInvoiceForm({
    competenceMonth: input.competenceMonth,
    assessmentStartDate: input.assessmentStartDate,
    assessmentEndDate: input.assessmentEndDate,
    invoiceTotalValue: totals.invoiceTotalValue,
    minimumFranchiseValue: input.minimumFranchiseValue,
    invoiceFile: input.invoiceFile,
  });
  const errors: DirectPostpaidInvoiceFormErrors = common.valid ? {} : { ...common.errors };

  if (common.valid && input.usedCompetenceMonths.includes(common.value.competenceMonth)) {
    errors.competenceMonth = "Esta competência já foi utilizada para o fornecedor";
  }

  if (input.sources.length === 0) {
    errors.sources = "Nenhuma fonte vinculada para o período informado.";
  } else if (
    input.sources.some(
      (source) =>
        normalizedSourceCost(source, source.unitCost) === null ||
        normalizedSourceCost(source, source.totalCost) === null ||
        (source.providerChargedQuantity !== null &&
          (!Number.isInteger(source.providerChargedQuantity) ||
            source.providerChargedQuantity < 0)),
    )
  ) {
    errors.sources = "Informe valores unitário e total válidos para todas as fontes.";
  }

  if (!common.valid || Object.keys(errors).length > 0) {
    return { valid: false, value: null, errors };
  }

  return {
    valid: true,
    errors: {},
    value: {
      invoiceFile: common.value.invoiceFile,
      payload: {
        competenceMonth: common.value.competenceMonth,
        assessmentStartDate: common.value.assessmentStartDate,
        assessmentEndDate: common.value.assessmentEndDate,
        invoiceTotalValue: totals.invoiceTotalValue,
        minimumFranchiseValue: common.value.minimumFranchiseValue,
        sources: input.sources.map((source) => ({
          dataSourceProviderId: source.dataSourceProviderId,
          providerChargedQuantity: source.providerChargedQuantity,
          unitCost: normalizedSourceCost(source, source.unitCost) as string,
          totalCost: normalizedSourceCost(source, source.totalCost) as string,
        })),
      },
    },
  };
}
