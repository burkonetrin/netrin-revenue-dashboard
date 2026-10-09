import type { ProviderInvoiceBillableSourceResponse } from "../types/providerInvoices.types";

export interface ProviderInvoiceSourceAllocation extends ProviderInvoiceBillableSourceResponse {
  providerChargedQuantity: number;
  unitCost: string;
  totalCost: string;
}

export type ProviderInvoiceAllocationResult =
  | {
      status: "valid";
      effectiveInvoiceValue: string;
      totalEligibleQuantity: number;
      sources: ProviderInvoiceSourceAllocation[];
    }
  | {
      status: "invalid";
      reason: "no-billable-queries";
      effectiveInvoiceValue: string;
      totalEligibleQuantity: 0;
      sources: ProviderInvoiceSourceAllocation[];
    };

function toCents(value: number | string): number {
  return Math.round(Number(value) * 100);
}

function fromCents(value: number): string {
  return (value / 100).toFixed(2);
}

/**
 * Aplica a franquia mínima ao valor informado da fatura.
 */
export function getEffectiveProviderInvoiceValue(
  invoiceTotalValue: number | string,
  minimumFranchiseValue?: number | string | null,
): string {
  const totalCents = toCents(invoiceTotalValue);
  const franchiseCents =
    minimumFranchiseValue === undefined || minimumFranchiseValue === null
      ? 0
      : toCents(minimumFranchiseValue);

  return fromCents(Math.max(totalCents, franchiseCents));
}

/**
 * Distribui o valor efetivo entre as fontes conforme consultas bilhetadas.
 */
export function calculateProviderInvoiceAllocation(
  invoiceTotalValue: number | string,
  minimumFranchiseValue: number | string | null | undefined,
  sources: ProviderInvoiceBillableSourceResponse[],
): ProviderInvoiceAllocationResult {
  const effectiveInvoiceValue = getEffectiveProviderInvoiceValue(
    invoiceTotalValue,
    minimumFranchiseValue,
  );
  const totalEligibleQuantity = sources.reduce(
    (total, source) => total + Math.max(0, source.clientBillableQuantity),
    0,
  );
  const eligibleSources = sources.filter((source) => source.clientBillableQuantity > 0);
  const effectiveCents = toCents(effectiveInvoiceValue);

  if (totalEligibleQuantity === 0) {
    return {
      status: "invalid",
      reason: "no-billable-queries",
      effectiveInvoiceValue,
      totalEligibleQuantity: 0,
      sources: sources.map((source) => ({
        ...source,
        providerChargedQuantity: 0,
        unitCost: "0.00",
        totalCost: "0.00",
      })),
    };
  }

  let distributedCents = 0;
  const allocations = sources.map((source) => {
    if (source.clientBillableQuantity <= 0) {
      return {
        ...source,
        providerChargedQuantity: 0,
        unitCost: "0.00",
        totalCost: "0.00",
      };
    }

    const eligibleIndex = eligibleSources.indexOf(source);
    const isLastEligible = eligibleIndex === eligibleSources.length - 1;
    const roundedCost = isLastEligible
      ? effectiveCents - distributedCents
      : Math.round((effectiveCents * source.clientBillableQuantity) / totalEligibleQuantity);
    distributedCents += roundedCost;

    return {
      ...source,
      providerChargedQuantity: source.clientBillableQuantity,
      unitCost: fromCents(roundedCost / source.clientBillableQuantity),
      totalCost: fromCents(roundedCost),
    };
  });

  return {
    status: "valid",
    effectiveInvoiceValue,
    totalEligibleQuantity,
    sources: allocations,
  };
}
