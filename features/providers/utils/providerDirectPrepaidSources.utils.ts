import type { ProviderInvoiceBillableSourceResponse } from "../types/providerInvoices.types";
import { calculateProviderInvoiceAllocation } from "./providerInvoiceAllocation.utils";

export interface DirectPrepaidSource extends ProviderInvoiceBillableSourceResponse {
  providerChargedQuantity: number | null;
  unitCost: string;
  totalCost: string;
}

export type DirectPrepaidSourceAllocation =
  | {
      status: "valid";
      totalEligibleQuantity: number;
      sources: DirectPrepaidSource[];
    }
  | {
      status: "invalid";
      reason: "no-billable-queries";
      totalEligibleQuantity: 0;
      sources: DirectPrepaidSource[];
    };

export interface DirectPrepaidSourceTotals {
  informedSourcesCost: string;
}

export type DirectPrepaidSourcesValidation =
  | { valid: true; value: DirectPrepaidSource[]; errors: Record<string, never> }
  | { valid: false; value: null; errors: { sources: string } };

function toCents(value: number | string): number {
  return Math.round(Number(value) * 100);
}

function fromCents(value: number): string {
  return (value / 100).toFixed(2);
}

function normalizeMoney(value: string): string | null {
  const trimmed = value.trim().replace(/^R\$\s?/, "");
  if (!trimmed || trimmed.startsWith("-")) return null;

  const normalized = trimmed.includes(",") ? trimmed.replace(/\./g, "").replace(",", ".") : trimmed;
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? fromCents(toCents(parsed)) : null;
}

function billableQuantity(source: DirectPrepaidSource): number {
  return Math.max(source.clientBillableQuantity, 0);
}

/** Distributes the final competence cost by billed queries while preserving zero-query rows. */
export function allocateDirectPrepaidSources(
  finalCost: string,
  sources: ProviderInvoiceBillableSourceResponse[],
): DirectPrepaidSourceAllocation {
  const allocation = calculateProviderInvoiceAllocation(finalCost, null, sources);

  if (allocation.status === "invalid") {
    return {
      status: "invalid",
      reason: allocation.reason,
      totalEligibleQuantity: 0,
      sources: allocation.sources,
    };
  }

  return {
    status: "valid",
    totalEligibleQuantity: allocation.totalEligibleQuantity,
    sources: allocation.sources,
  };
}

/** Keeps total and unit cost synchronized for rows with billed queries. */
export function updateDirectPrepaidSource(
  source: DirectPrepaidSource,
  field: "unitCost" | "totalCost",
  value: string,
): DirectPrepaidSource {
  const normalized = normalizeMoney(value);
  if (normalized === null) return { ...source, [field]: value };

  const quantity = billableQuantity(source);
  const valueInCents = toCents(normalized);

  if (field === "totalCost") {
    return {
      ...source,
      totalCost: normalized,
      unitCost: quantity > 0 ? fromCents(Math.round(valueInCents / quantity)) : source.unitCost,
    };
  }

  return {
    ...source,
    unitCost: normalized,
    totalCost: quantity > 0 ? fromCents(valueInCents * quantity) : source.totalCost,
  };
}

/** Sums source values entered by the operator without recalculating the competence cost. */
export function getDirectPrepaidSourceTotals(
  sources: DirectPrepaidSource[],
): DirectPrepaidSourceTotals {
  return {
    informedSourcesCost: fromCents(
      sources.reduce(
        (total, source) => total + toCents(normalizeMoney(source.totalCost) ?? "0"),
        0,
      ),
    ),
  };
}

/** Validates mandatory source amounts before a competence can be submitted. */
export function validateDirectPrepaidSources(
  sources: DirectPrepaidSource[],
): DirectPrepaidSourcesValidation {
  if (
    sources.length === 0 ||
    sources.some(
      (source) =>
        normalizeMoney(source.unitCost) === null ||
        normalizeMoney(source.totalCost) === null ||
        (source.providerChargedQuantity !== null &&
          (!Number.isInteger(source.providerChargedQuantity) ||
            source.providerChargedQuantity < 0)),
    )
  ) {
    return {
      valid: false,
      value: null,
      errors: { sources: "Informe valores total e por consulta válidos para todas as fontes." },
    };
  }

  return {
    valid: true,
    errors: {},
    value: sources.map((source) => ({
      ...source,
      unitCost: normalizeMoney(source.unitCost) as string,
      totalCost: normalizeMoney(source.totalCost) as string,
    })),
  };
}
