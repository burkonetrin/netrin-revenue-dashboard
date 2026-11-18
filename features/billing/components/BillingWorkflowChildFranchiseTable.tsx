"use client";

import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import type { BillingFranchiseLine } from "../types/billing-detail.types";

interface BillingWorkflowChildFranchiseTableProps {
  franchises: BillingFranchiseLine[];
  columns: ColumnConfig<BillingFranchiseLine>[];
}

/**
 * Tabela aninhada de franquias filhas de Workflow no detalhe da fatura.
 */
export function BillingWorkflowChildFranchiseTable({
  franchises,
  columns,
}: BillingWorkflowChildFranchiseTableProps) {
  return (
    <DynamicTable
      columns={columns}
      data={franchises}
      keyExtractor={(row) => row.id}
      disableRowHover
      emptyMessage="Nenhuma franquia filha encontrada"
      classNames={{
        wrapper: "shadow-none mb-0",
        th: "bg-default-100 text-gray-700 font-semibold text-xs h-11",
        td: "text-gray-900 border-b border-gray-200 h-11 text-xs align-middle bg-white",
      }}
    />
  );
}