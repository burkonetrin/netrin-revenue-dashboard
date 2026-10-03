"use client";

import { formatCurrency } from "@/shared/utils/currency";

interface BillingInvoiceTotalBannerProps {
  total: number;
}

/**
 * Banner com total consolidado da fatura.
 */
export function BillingInvoiceTotalBanner({ total }: BillingInvoiceTotalBannerProps) {
  return (
    <div className="rounded-lg bg-primary p-4 text-white">
      <p className="text-xs font-medium text-white/80">Total da fatura</p>
      <p className="mt-1 text-2xl font-semibold">{formatCurrency(total)}</p>
    </div>
  );
}
