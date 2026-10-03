"use client";

import { formatCurrency } from "@/shared/utils/currency";
import type { BillingFranchiseLine } from "../types/billing-detail.types";

interface BillingFranchiseExcessCellProps {
  franchise: BillingFranchiseLine;
}

/**
 * Célula de excedente da franquia (label + valor em sublabel cinza, quando houver).
 */
export function BillingFranchiseExcessCell({ franchise }: BillingFranchiseExcessCellProps) {
  if (franchise.excessLabel) {
    return (
      <div className="flex flex-col">
        <span>{franchise.excessLabel}</span>
        {franchise.excessSublabel ? (
          <span className="text-gray-500">{franchise.excessSublabel}</span>
        ) : null}
      </div>
    );
  }

  if (franchise.excessSublabel) {
    return <span>{franchise.excessSublabel}</span>;
  }

  return <span>{formatCurrency(franchise.excessAmount)}</span>;
}
