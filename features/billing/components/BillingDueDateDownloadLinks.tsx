"use client";

import { Download } from "lucide-react";
import type { BillingInvoiceStatusKey } from "../types/billing-invoice-status.types";

const linkClassName =
  "inline-flex items-center gap-1 text-xs text-primary underline hover:opacity-80";

interface BillingDueDateDownloadLinksProps {
  className?: string;
}

export function shouldShowBillingDownloadLinks(status: BillingInvoiceStatusKey): boolean {
  return status !== "fatura_aberta" && status !== "fatura_fechada";
}

/**
 * Links de download NF-e e boleto (protótipo mock).
 */
export function BillingDueDateDownloadLinks({ className = "" }: BillingDueDateDownloadLinksProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 ${className}`.trim()}
      onClick={(event) => event.stopPropagation()}
    >
      <button type="button" className={linkClassName}>
        <Download size={14} className="shrink-0 text-primary" aria-hidden />
        NF-e
      </button>
      <button type="button" className={linkClassName}>
        <Download size={14} className="shrink-0 text-primary" aria-hidden />
        Boleto
      </button>
    </div>
  );
}
