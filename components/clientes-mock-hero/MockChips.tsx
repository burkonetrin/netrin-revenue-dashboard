"use client";

import { Chip } from "@heroui/react";
import {
  INVOICE_STATUS,
  SC,
  SL,
  type ClientHealthKey,
  type InvoiceStatusKey,
} from "../../clientesDashboardMockData";
import { invoiceStatusLabel } from "../../clientesDashboardMockFormat";

const INVOICE_CHIP_CLASS: Record<string, string> = {
  "inv-open": "bg-zinc-100 text-zinc-600",
  "inv-sent": "bg-indigo-100 text-indigo-900",
  "inv-due": "bg-amber-100 text-amber-900",
  "inv-partial": "bg-orange-100 text-orange-800",
  "inv-paid": "bg-green-100 text-green-800",
  "inv-cancel-req": "bg-pink-100 text-pink-900",
  "inv-cancelled": "bg-red-100 text-red-900",
};

const HEALTH_CHIP_CLASS: Record<string, string> = {
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-red-100 text-red-800",
  secondary: "bg-primary-50 text-primary",
};

export function ClientStatusChip({ ativo }: { ativo: boolean }) {
  return (
    <Chip
      size="sm"
      variant="flat"
      classNames={{
        base: ativo
          ? "bg-green-100 text-green-800 h-auto"
          : "bg-zinc-100 text-zinc-600 h-auto",
        content: "text-[11px] font-medium px-2.5 py-0.5",
      }}
    >
      {ativo ? "Ativo" : "Inativo"}
    </Chip>
  );
}

export function InvoiceStatusChip({
  statusKey,
  valorPagoParcial,
}: {
  statusKey: InvoiceStatusKey;
  valorPagoParcial?: number;
}) {
  const meta = INVOICE_STATUS[statusKey] ?? {
    label: statusKey,
    chip: "inv-open",
  };
  const label = invoiceStatusLabel(statusKey, valorPagoParcial);
  return (
    <Chip
      size="sm"
      variant="flat"
      classNames={{
        base: `${INVOICE_CHIP_CLASS[meta.chip] ?? INVOICE_CHIP_CLASS["inv-open"]} h-auto max-w-full`,
        content: "text-[10px] font-medium px-2 py-0.5 leading-snug",
      }}
    >
      {label}
    </Chip>
  );
}

export function HealthChip({ health }: { health: ClientHealthKey }) {
  const variant = SC[health];
  return (
    <Chip
      size="sm"
      variant="flat"
      classNames={{
        base: `${HEALTH_CHIP_CLASS[variant] ?? ""} h-auto`,
        content: "text-[11px] font-medium px-2.5 py-0.5",
      }}
    >
      {SL[health]}
    </Chip>
  );
}
