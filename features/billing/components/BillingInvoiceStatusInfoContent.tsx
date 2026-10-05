"use client";

import type { ReactNode } from "react";
import { formatCurrency } from "@/shared/utils/currency";
import { TOOLTIP_BODY_CLASS } from "@/shared/constants/tooltip.constants";
import type {
  BillingInvoiceStatusKey,
  BillingInvoiceStatusMeta,
} from "../types/billing-invoice-status.types";

export function getBillingInvoiceStatusInfoContent(
  status: BillingInvoiceStatusKey,
  meta?: BillingInvoiceStatusMeta,
): ReactNode | null {
  if (status === "pago_parcial" || status === "nota_vencida") {
    if (meta?.paidAmount != null && meta?.dueAmount != null) {
      return (
        <div className={`space-y-1 ${TOOLTIP_BODY_CLASS}`}>
          <p>Valor pago: {formatCurrency(meta.paidAmount)}</p>
          <p>Valor a pagar: {formatCurrency(meta.dueAmount)}</p>
        </div>
      );
    }
  }
  if (status === "pago_excedente" && meta?.excessAmount != null) {
    return (
      <span className={TOOLTIP_BODY_CLASS}>
        Valor pago em excedente: {formatCurrency(meta.excessAmount)}.
      </span>
    );
  }
  if (status === "nota_cancelada" && meta?.cancelReason) {
    return <span className={TOOLTIP_BODY_CLASS}>{meta.cancelReason}</span>;
  }
  return null;
}

interface BillingInvoiceStatusInfoContentProps {
  status: BillingInvoiceStatusKey;
  meta?: BillingInvoiceStatusMeta;
}

export function BillingInvoiceStatusInfoContent({
  status,
  meta,
}: BillingInvoiceStatusInfoContentProps) {
  const content = getBillingInvoiceStatusInfoContent(status, meta);
  if (!content) return null;
  return <>{content}</>;
}
