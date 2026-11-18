"use client";

import { CLIENTS_PERMISSIONS } from "@/features/clients/constants/clientsPermissions.constants";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { usePermission } from "@/shared/hooks/usePermission";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { Mail } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { TableExpandButton } from "@/components/clientes-mock-hero/TableExpandButton";
import { canClientsOrBillingInvoice } from "../constants/billingInvoicePermissions.constants";
import type { BillingFranchiseLine } from "../types/billing-detail.types";
import type { BillingInvoiceScope } from "../types/billing.types";
import {
  getFranchiseTableColumns,
  getFranchiseValueDisplay,
  getTopLevelBillingFranchises,
  getWorkflowChildFranchiseTableColumns,
} from "../utils/billing-detail.utils";
import { formatBillingDate } from "../utils/billing.utils";
import { BillingFranchiseConsumptionCell } from "./BillingFranchiseConsumptionCell";
import { BillingFranchiseExcessCell } from "./BillingFranchiseExcessCell";
import { BillingFranchiseTotalCell } from "./BillingFranchiseTotalCell";
import { BillingFranchiseValueCell } from "./BillingFranchiseValueCell";
import { BillingWorkflowChildFranchiseTable } from "./BillingWorkflowChildFranchiseTable";

function hasWorkflowChildRows(franchise: BillingFranchiseLine) {
  return (franchise.childFranchises?.length ?? 0) > 0;
}

type FranchiseColumnHandlers = {
  canSendEmail: boolean;
  onSendEmail: (franchise: BillingFranchiseLine) => void;
  expandedRowKeys: Set<string>;
  toggleExpanded: (rowId: string) => void;
};

function applyFranchiseColumnRenders(
  baseColumns: ColumnConfig<BillingFranchiseLine>[],
  handlers: FranchiseColumnHandlers,
  options?: { includeRowExpand?: boolean; includeSendEmail?: boolean },
): ColumnConfig<BillingFranchiseLine>[] {
  const { canSendEmail, expandedRowKeys, onSendEmail, toggleExpanded } = handlers;
  const includeRowExpand = options?.includeRowExpand ?? true;
  const includeSendEmail = options?.includeSendEmail ?? true;

  return baseColumns.map((column) => {
    switch (column.id) {
      case "dueDate":
        return {
          ...column,
          render: (_value: unknown, row: BillingFranchiseLine) =>
            formatBillingDate(row.dueDate ?? ""),
        };
      case "pricingModel":
        return {
          ...column,
          render: (_value: unknown, row: BillingFranchiseLine) => {
            const display = getFranchiseValueDisplay(row);
            return (
              <BillingFranchiseValueCell
                text={display.text}
                showTooltip={display.showTooltip}
                franchise={row}
              />
            );
          },
        };
      case "productName":
        return {
          ...column,
          render: (_value: unknown, row: BillingFranchiseLine) => (
            <span>{row.productName?.trim() || "—"}</span>
          ),
        };
      case "consumption":
        return {
          ...column,
          render: (_value: unknown, row: BillingFranchiseLine) => (
            <BillingFranchiseConsumptionCell
              consumption={row.consumption}
              consumptionInfo={row.consumptionInfo}
            />
          ),
        };
      case "excessAmount":
        return {
          ...column,
          render: (_value: unknown, row: BillingFranchiseLine) => (
            <BillingFranchiseExcessCell franchise={row} />
          ),
        };
      case "total":
        return {
          ...column,
          render: (_value: number, row: BillingFranchiseLine) => (
            <BillingFranchiseTotalCell franchise={row} />
          ),
        };
      case "sendEmail":
        return {
          ...column,
          render: (_value: unknown, row: BillingFranchiseLine) => {
            if (!includeSendEmail || !canSendEmail) return null;

            return (
              <div className="flex justify-center">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label={`Enviar detalhes de ${row.name}`}
                  onPress={() => onSendEmail(row)}
                >
                  <Mail size={16} className="text-primary" />
                </Button>
              </div>
            );
          },
        };
      case "rowExpand":
        return {
          ...column,
          render: (_value: unknown, row: BillingFranchiseLine) => {
            if (!includeRowExpand || !hasWorkflowChildRows(row)) {
              return null;
            }

            const isExpanded = expandedRowKeys.has(row.id);

            return (
              <TableExpandButton
                expanded={isExpanded}
                ariaLabel={
                  isExpanded
                    ? `Recolher franquias filhas de ${row.name}`
                    : `Expandir franquias filhas de ${row.name}`
                }
                onClick={() => toggleExpanded(row.id)}
              />
            );
          },
        };
      default:
        return column;
    }
  });
}

type FranchiseBodyRow =
  | { kind: "main"; franchise: BillingFranchiseLine }
  | { kind: "nested"; franchise: BillingFranchiseLine; children: BillingFranchiseLine[] };

function buildFranchiseBodyRows(
  franchises: BillingFranchiseLine[],
  expandedRowKeys: Set<string>,
): FranchiseBodyRow[] {
  const rows: FranchiseBodyRow[] = [];

  for (const franchise of franchises) {
    rows.push({ kind: "main", franchise });

    if (!expandedRowKeys.has(franchise.id)) {
      continue;
    }

    const children = franchise.childFranchises;
    if (!children?.length) {
      continue;
    }

    rows.push({ kind: "nested", franchise, children });
  }

  return rows;
}

function renderFranchiseCell(
  column: ColumnConfig<BillingFranchiseLine>,
  row: BillingFranchiseLine,
) {
  const record = row as unknown as Record<string, unknown>;

  if (column.render) {
    return column.render(record[column.id as string], row);
  }

  return String(record[column.id as string] ?? "");
}

interface BillingFranchiseTableProps {
  franchises: BillingFranchiseLine[];
  scope: BillingInvoiceScope;
  onSendEmail: (franchise: BillingFranchiseLine) => void;
  hideBottomBorder?: boolean;
}

/**
 * Tabela de franquias e consumo no detalhe da fatura.
 */
export function BillingFranchiseTable({
  franchises,
  scope,
  onSendEmail,
  hideBottomBorder = false,
}: BillingFranchiseTableProps) {
  const { can } = usePermission();
  const canSendEmail = canClientsOrBillingInvoice(can, CLIENTS_PERMISSIONS.sendEmail);
  const [expandedRowKeys, setExpandedRowKeys] = useState<Set<string>>(() => new Set());

  const toggleExpanded = useCallback((rowId: string) => {
    setExpandedRowKeys((previous) => {
      const next = new Set(previous);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);

  const columnHandlers = useMemo(
    () => ({
      canSendEmail,
      onSendEmail,
      expandedRowKeys,
      toggleExpanded,
    }),
    [canSendEmail, expandedRowKeys, onSendEmail, toggleExpanded],
  );

  const columns = useMemo(
    () =>
      applyFranchiseColumnRenders(getFranchiseTableColumns(scope), columnHandlers),
    [columnHandlers, scope],
  );

  const childFranchiseColumns = useMemo(
    () =>
      applyFranchiseColumnRenders(
        getWorkflowChildFranchiseTableColumns(scope),
        {
          canSendEmail,
          onSendEmail,
          expandedRowKeys: new Set(),
          toggleExpanded,
        },
        { includeRowExpand: false, includeSendEmail: false },
      ),
    [canSendEmail, onSendEmail, toggleExpanded, scope],
  );

  const topLevelFranchises = useMemo(
    () => getTopLevelBillingFranchises(franchises),
    [franchises],
  );

  const bodyRows = useMemo(
    () => buildFranchiseBodyRows(topLevelFranchises, expandedRowKeys),
    [expandedRowKeys, topLevelFranchises],
  );

  const tdClass = hideBottomBorder
    ? "text-gray-900 h-12 text-xs align-middle"
    : "text-gray-900 border-b border-gray-200 h-12 text-xs align-middle";

  return (
    <Table
      removeWrapper
      aria-label="Franquias da fatura"
      classNames={{
        wrapper: "shadow-none mb-0",
        table: hideBottomBorder
          ? "w-full [&_tbody_tr:not(:last-child)_td]:border-b [&_tbody_tr:not(:last-child)_td]:border-gray-200"
          : "w-full",
        th: "bg-default-100 text-gray-500 font-semibold text-xs h-11",
        td: tdClass,
      }}
    >
      <TableHeader>
        {columns.map((column) => (
          <TableColumn
            key={String(column.id)}
            align={column.align}
            className={column.headerClassName}
          >
            {column.label}
          </TableColumn>
        ))}
      </TableHeader>
      <TableBody emptyContent="Nenhuma franquia encontrada">
        {bodyRows.map((bodyRow) => {
          if (bodyRow.kind === "main") {
            const row = bodyRow.franchise;
            return (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={String(column.id)} className={column.cellClassName}>
                    {renderFranchiseCell(column, row)}
                  </TableCell>
                ))}
              </TableRow>
            );
          }

          return (
            <TableRow key={`${bodyRow.franchise.id}-workflow-children`}>
              <TableCell
                colSpan={columns.length}
                className="p-0 border-b border-gray-200 align-top"
              >
                <div className="bg-gray-50/50 px-4 py-4">
                  <BillingWorkflowChildFranchiseTable
                    franchises={bodyRow.children}
                    columns={childFranchiseColumns}
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}