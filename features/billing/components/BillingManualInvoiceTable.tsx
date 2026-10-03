"use client";

import { DynamicTable } from "@/shared/components/DynamicTable";
import { formatCurrency } from "@/shared/utils/currency";
import { useMemo } from "react";
import type { BillingManualInvoice } from "../types/billing-detail.types";
import type { BillingInvoiceScope } from "../types/billing.types";
import {
  formatManualInvoiceDescriptionLabel,
  getManualInvoiceTableColumns,
  type ManualInvoiceTablePlacement,
} from "../utils/billing-detail.utils";
import { formatBillingCompetence, formatBillingDate } from "../utils/billing.utils";

interface BillingManualInvoiceTableProps {
  invoices: BillingManualInvoice[];
  scope: BillingInvoiceScope;
  placement: ManualInvoiceTablePlacement;
}

/**
 * Tabela de faturas manuais vinculadas ao detalhe.
 */
export function BillingManualInvoiceTable({
  invoices,
  scope,
  placement,
}: BillingManualInvoiceTableProps) {
  const columns = useMemo(() => {
    const hasSeparateNote = invoices.some((invoice) => invoice.separateNote);
    const baseColumns = getManualInvoiceTableColumns(scope, placement, { hasSeparateNote });

    return baseColumns.map((column) => {
      switch (column.id) {
        case "description":
          return {
            ...column,
            render: (_value: unknown, row: BillingManualInvoice) =>
              formatManualInvoiceDescriptionLabel(row),
          };
        case "competence":
          return {
            ...column,
            render: (_value: unknown, row: BillingManualInvoice) =>
              row.competence ? formatBillingCompetence(row.competence) : "-",
          };
        case "dueDate":
          return {
            ...column,
            render: (_value: unknown, row: BillingManualInvoice) =>
              row.dueDate ? formatBillingDate(row.dueDate) : "-",
          };
        case "value":
          return {
            ...column,
            render: (value: number) => (Number.isFinite(value) ? formatCurrency(value) : "-"),
          };
        default:
          return column;
      }
    });
  }, [invoices, placement, scope]);

  if (invoices.length === 0) return null;

  return (
    <DynamicTable
      columns={columns}
      data={invoices}
      keyExtractor={(row) => row.id}
      disableRowHover
      emptyMessage="Nenhuma fatura manual encontrada"
      classNames={{
        wrapper: "shadow-none mb-0",
        table: "w-full",
        th: "bg-default-100 text-gray-500 font-semibold text-xs h-11",
        td: "text-gray-900 border-b border-gray-200 h-12 text-xs align-top",
      }}
    />
  );
}
