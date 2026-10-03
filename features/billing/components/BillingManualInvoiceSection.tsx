"use client";

import type { BillingManualInvoice } from "../types/billing-detail.types";
import type { BillingInvoiceScope } from "../types/billing.types";
import type { ManualInvoiceTablePlacement } from "../utils/billing-detail.utils";
import { BillingManualInvoiceTable } from "./BillingManualInvoiceTable";

interface BillingManualInvoiceSectionProps {
  invoices: BillingManualInvoice[];
  scope: BillingInvoiceScope;
  placement: ManualInvoiceTablePlacement;
  title?: string;
  embedded?: boolean;
}

/**
 * Seção de faturas manuais no detalhe da fatura.
 * Uma tabela por seção (placement). Nota separada vs integrada continua
 * separada via partitionManualInvoices no nível da página.
 */
export function BillingManualInvoiceSection({
  invoices,
  scope,
  placement,
  title = "Projetos e setups",
  embedded = false,
}: BillingManualInvoiceSectionProps) {
  if (invoices.length === 0) return null;

  return (
    <section className={embedded ? "mt-6 space-y-3" : "space-y-4"}>
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>

      <BillingManualInvoiceTable invoices={invoices} scope={scope} placement={placement} />
    </section>
  );
}
