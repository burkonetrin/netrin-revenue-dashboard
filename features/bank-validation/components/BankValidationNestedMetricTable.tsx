"use client";

import { DynamicTable } from "@/shared/components/DynamicTable";
import { useMemo, useState } from "react";
import type {
  BankValidationSourceInfo,
  BankValidationTransactionQualityRow,
} from "../types/bank-validation.types";
import { buildBankValidationSourceColumns } from "../utils/bankValidationMetricTable.shared";
import { formatBankValidationQualityTotalValue } from "../utils/qualityMetrics";

export const BANK_VALIDATION_NESTED_EXPAND_CLASS =
  "border-l border-[#38BDF8] pb-3 pl-3 pr-3 pt-3";

const NESTED_TABLE_CLASS_NAMES = {
  table: "border-collapse border-spacing-0",
  th: "bg-default-100 text-left text-xs font-semibold text-default-600",
  td: "h-12 border-b border-default-100 bg-white text-left text-xs text-gray-900",
} as const;

type NestedExpandConfig = {
  rowId: BankValidationTransactionQualityRow["id"];
  metricColumnLabel: string;
  rows: BankValidationTransactionQualityRow[];
  excludeRowIds?: BankValidationTransactionQualityRow["id"][];
};

interface BankValidationNestedMetricTableProps {
  rows: BankValidationTransactionQualityRow[];
  sources: BankValidationSourceInfo[];
  metricColumnLabel: string;
  excludeRowIds?: BankValidationTransactionQualityRow["id"][];
  isLoading?: boolean;
  emptyMessage: string;
  nestedExpand?: NestedExpandConfig;
}

/**
 * Tabela aninhada de métricas de qualidade com expansão no padrão da gestão financeira.
 */
export function BankValidationNestedMetricTable({
  rows,
  sources,
  metricColumnLabel,
  excludeRowIds = [],
  isLoading,
  emptyMessage,
  nestedExpand,
}: BankValidationNestedMetricTableProps) {
  const [expandedRowKeys, setExpandedRowKeys] = useState<Set<string | number>>(new Set());

  const filteredRows = useMemo(
    () => rows.filter((row) => !excludeRowIds.includes(row.id)),
    [excludeRowIds, rows],
  );

  const columns = useMemo(
    () =>
      buildBankValidationSourceColumns(
        sources,
        formatBankValidationQualityTotalValue,
        { metricColumnLabel },
      ),
    [metricColumnLabel, sources],
  );

  const expandRowId = nestedExpand?.rowId;
  const expandable = Boolean(nestedExpand);

  return (
    <div className="min-w-[720px]">
      <DynamicTable
        layout="fixed"
        columns={columns}
        data={filteredRows}
        emptyMessage={emptyMessage}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
        expandable={expandable}
        expandButtonLabel="métrica"
        isRowExpandable={(row) => row.id === expandRowId}
        isRowClickable={(row) => row.id === expandRowId}
        expandedRowKeys={expandedRowKeys}
        onExpandedChange={(key, isExpanded) => {
          setExpandedRowKeys((previous) => {
            const next = new Set(previous);
            if (isExpanded) {
              next.add(key);
            } else {
              next.delete(key);
            }
            return next;
          });
        }}
        expandedContent={
          nestedExpand
            ? () => (
                <BankValidationNestedMetricTable
                  rows={nestedExpand.rows}
                  sources={sources}
                  metricColumnLabel={nestedExpand.metricColumnLabel}
                  excludeRowIds={nestedExpand.excludeRowIds}
                  emptyMessage={emptyMessage}
                  isLoading={isLoading}
                />
              )
            : undefined
        }
        expandedContentClassName={BANK_VALIDATION_NESTED_EXPAND_CLASS}
        classNames={NESTED_TABLE_CLASS_NAMES}
      />
    </div>
  );
}