"use client";

import type { BillingFranchiseConsumption } from "../types/billing-detail.types";

interface BillingFranchiseConsumptionCellProps {
  consumption: BillingFranchiseConsumption;
}

/**
 * Célula de consumo da franquia.
 */
export function BillingFranchiseConsumptionCell({
  consumption,
}: BillingFranchiseConsumptionCellProps) {
  return (
    <div className="flex flex-col">
      <span>{consumption.label}</span>
      {consumption.sublabel ? <span className="text-gray-500">{consumption.sublabel}</span> : null}
    </div>
  );
}
