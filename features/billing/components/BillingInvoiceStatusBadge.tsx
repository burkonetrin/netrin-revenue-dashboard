"use client";

import {
  BILLING_INVOICE_STATUS_CHIP_CLASS,
  BILLING_INVOICE_STATUS_LABEL,
  type BillingInvoiceStatusKey,
  type BillingInvoiceStatusMeta,
} from "../types/billing-invoice-status.types";
import {
  HEROUI_TOOLTIP_CONTENT_CLASS_NAMES,
} from "@/shared/constants/tooltip.constants";
import { Chip, Tooltip } from "@heroui/react";
import { InfoOutlineButton } from "@/shared/components/InfoOutlineIcon";
import { getBillingInvoiceStatusInfoContent } from "./BillingInvoiceStatusInfoContent";

interface BillingInvoiceStatusBadgeProps {
  status: BillingInvoiceStatusKey;
  meta?: BillingInvoiceStatusMeta;
  className?: string;
  /** Na tooltip multi-nota, detalhes ficam inline — sem ícone “i”. */
  suppressInfoTooltip?: boolean;
}

export function BillingInvoiceStatusBadge({
  status,
  meta,
  className,
  suppressInfoTooltip = false,
}: BillingInvoiceStatusBadgeProps) {
  const label = BILLING_INVOICE_STATUS_LABEL[status];
  const chipClass = BILLING_INVOICE_STATUS_CHIP_CLASS[status];
  const tooltip = getBillingInvoiceStatusInfoContent(status, meta);

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

  if (!tooltip || suppressInfoTooltip) {
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
