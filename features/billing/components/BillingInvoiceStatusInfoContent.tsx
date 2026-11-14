"use client";

import type { ReactNode } from "react";
import { formatCurrency } from "@/shared/utils/currency";
import {
  TOOLTIP_BODY_CLASS,
  TOOLTIP_TITLE_CLASS,
} from "@/shared/constants/tooltip.constants";
import { getBillingDueDateDisplay } from "../utils/billing.utils";
import type {
  BillingInvoiceStatusKey,
  BillingInvoiceStatusMeta,
} from "../types/billing-invoice-status.types";
import { BILLING_INSTALLMENT_PAYMENT_STATUS_LABEL } from "../types/billing-invoice-status.types";

function resolveInterestAmount(meta?: BillingInvoiceStatusMeta): number | undefined {
  if (meta?.interestAmount != null) return meta.interestAmount;
  if (meta?.excessAmount != null) return meta.excessAmount;
  return undefined;
}

export function getBillingInvoiceStatusInfoContent(
  status: BillingInvoiceStatusKey,
  meta?: BillingInvoiceStatusMeta,
): ReactNode | null {
  if (status === "pago_parcial" || status === "nota_vencida") {
    if (meta?.paidAmount != null && meta?.dueAmount != null) {
      return (
        <div className={`w-full space-y-1 text-left ${TOOLTIP_BODY_CLASS}`}>
          <p>Valor pago: {formatCurrency(meta.paidAmount)}</p>
          <p>Valor a pagar: {formatCurrency(meta.dueAmount)}</p>
        </div>
      );
    }
  }
  if (status === "pago_excedente") {
    const interestAmount = resolveInterestAmount(meta);
    if (interestAmount != null) {
      return (
        <span className={TOOLTIP_BODY_CLASS}>
          Juros: {formatCurrency(interestAmount)}
        </span>
      );
    }
  }
  if (status === "pagamento_parcelado" && meta?.installments?.length) {
    return (
      <div className={`w-full space-y-3 text-left ${TOOLTIP_BODY_CLASS}`}>
        {meta.installments.map((line) => (
          <div key={line.installmentNumber} className="space-y-0.5">
            <p className={TOOLTIP_TITLE_CLASS}>Parcela {line.installmentNumber}</p>
            <p>Valor: {formatCurrency(line.amount)}</p>
            <p>
              Vencimento:{" "}
              {getBillingDueDateDisplay(line.dueDate, { emptyLabel: "—" })}
            </p>
            <p>Status: {BILLING_INSTALLMENT_PAYMENT_STATUS_LABEL[line.status]}</p>
          </div>
        ))}
      </div>
    );
  }
  if (status === "nota_cancelada" && meta?.cancelReason) {
    return (
      <p className={`block w-full text-left ${TOOLTIP_BODY_CLASS}`}>{meta.cancelReason}</p>
    );
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
