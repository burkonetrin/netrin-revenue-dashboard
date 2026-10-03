"use client";

import type { ReactNode } from "react";
import {
  BILLING_INVOICE_STATUS_CHIP_CLASS,
  BILLING_INVOICE_STATUS_LABEL,
  type BillingInvoiceStatusKey,
  type BillingInvoiceStatusMeta,
} from "../types/billing-invoice-status.types";
import { formatCurrency } from "@/shared/utils/currency";
import {
  HEROUI_TOOLTIP_CONTENT_CLASS_NAMES,
  TOOLTIP_BODY_CLASS,
} from "@/shared/constants/tooltip.constants";
import { Chip, Tooltip } from "@heroui/react";
import { InfoOutlineButton } from "@/shared/components/InfoOutlineIcon";

function buildStatusTooltipContent(
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

interface BillingInvoiceStatusBadgeProps {
  status: BillingInvoiceStatusKey;
  meta?: BillingInvoiceStatusMeta;
  className?: string;
}

export function BillingInvoiceStatusBadge({ status, meta, className }: BillingInvoiceStatusBadgeProps) {
  const label = BILLING_INVOICE_STATUS_LABEL[status];
  const chipClass = BILLING_INVOICE_STATUS_CHIP_CLASS[status];
  const tooltip = buildStatusTooltipContent(status, meta);

  const chip = (
    <Chip
      size="sm"
      variant="flat"
      classNames={{
        base: `${chipClass} h-auto max-w-full ${className ?? ""}`,
        content: "text-[10px] font-medium px-2 py-0.5 leading-snug",
      }}
    >
      {label}
    </Chip>
  );

  if (!tooltip) {
    return chip;
  }

  return (
    <span className="inline-flex items-center gap-1">
      {chip}
      <Tooltip
        content={tooltip}
        placement="top"
        radius="sm"
        showArrow
        classNames={HEROUI_TOOLTIP_CONTENT_CLASS_NAMES}
      >
        <span className="inline-flex">
          <InfoOutlineButton size="sm" aria-label="Informações do status" />
        </span>
      </Tooltip>
    </span>
  );
}
