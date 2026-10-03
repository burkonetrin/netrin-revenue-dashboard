"use client";

import { BillingInfoField } from "./BillingInfoField";

interface BillingInvoiceMetadataProps {
  competence?: string;
  dueDate?: string;
  showGlobalMetadata: boolean;
}

/**
 * Metadados da fatura (competência, vencimento, escopo).
 */
export function BillingInvoiceMetadata({
  competence,
  dueDate,
  showGlobalMetadata,
}: BillingInvoiceMetadataProps) {
  if (!showGlobalMetadata) {
    return null;
  }

  return (
    <section className="flex flex-wrap items-start gap-8 border-b border-gray-200 pb-4">
      <BillingInfoField label="Competência" value={competence ?? "-"} />
      <BillingInfoField label="Vencimento" value={dueDate ?? "-"} />
    </section>
  );
}
