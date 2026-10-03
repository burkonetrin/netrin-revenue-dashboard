"use client";

import type { BillingInvoiceScope } from "../types/billing.types";

interface BillingInvoiceDescriptionProps {
  description: string;
  scope: BillingInvoiceScope;
}

/**
 * Descrição textual da fatura.
 */
export function BillingInvoiceDescription({ description, scope }: BillingInvoiceDescriptionProps) {
  const sectionClass =
    scope === "client"
      ? "border-b border-gray-200 pb-6"
      : "border-y border-gray-200 py-6";

  return (
    <section className={sectionClass}>
      <p className="text-xs text-gray-500">Descrição</p>
      <p className="mt-1 text-sm text-gray-900">{description}</p>
    </section>
  );
}
