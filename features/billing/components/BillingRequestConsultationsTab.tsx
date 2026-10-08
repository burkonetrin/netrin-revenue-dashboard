"use client";

import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { useMemo, useState } from "react";
import { billingRequestConsultationsMock } from "../mock/billingRequestConsultations.mock";
import type { BillingRequestConsultationRow } from "../types/billing-request-consultation.types";
import { EMPTY_REQUEST_CONSULTATION_FILTERS } from "../types/support-tools-filters.types";
import {
  formatBillingRequestCache,
  formatBillingRequestDateTime,
} from "../utils/billing-request-consultation.utils";
import { downloadSupportToolsCsv } from "../utils/support-tools-csv-export.utils";
import {
  filterRequestConsultationRows,
  hasActiveRequestConsultationFilters,
} from "../utils/support-tools-filters.utils";
import { BillingRequestConsultationsFiltersDrawer } from "./BillingRequestConsultationsFiltersDrawer";
import { BillingRequestCodeCell } from "./BillingRequestCodeCell";
import {
  BillingRequestClientCell,
  BillingRequestDataSourceCell,
  BillingRequestExecutedAtCell,
  BillingRequestUserCell,
} from "./BillingRequestConsultationCells";
import { SupportToolsFiltersToolbar } from "./support-tools/SupportToolsFiltersToolbar";
import { SupportToolsTaskIdCell } from "./support-tools/SupportToolsTaskIdCell";
import {
  computeConsultationBillableSummary,
  SupportToolsSummaryCards,
} from "./support-tools/SupportToolsSummaryCards";

const FIT = "whitespace-nowrap w-[1%]";

const columns: ColumnConfig<BillingRequestConsultationRow>[] = [
  {
    id: "origin",
    label: "Origem",
    headerClassName: FIT,
    cellClassName: FIT,
    render: (_v, row) => row.origin,
  },
  {
    id: "username",
    label: "Usuário",
    render: (_v, row) => <BillingRequestUserCell row={row} />,
  },
  {
    id: "document",
    label: "Documento",
    headerClassName: FIT,
    cellClassName: FIT,
    render: (_v, row) => row.document,
  },
  {
    id: "dataSourceName",
    label: "Fontes",
    render: (_v, row) => <BillingRequestDataSourceCell row={row} />,
  },
  {
    id: "clientName",
    label: "Cliente",
    render: (_v, row) => <BillingRequestClientCell row={row} />,
  },
  {
    id: "statusCode",
    label: "Código",
    headerClassName: FIT,
    cellClassName: FIT,
    render: (_v, row) => <BillingRequestCodeCell statusCode={row.statusCode} />,
  },
  {
    id: "executedAt",
    label: "Data/hora da requisição",
    headerClassName: FIT,
    cellClassName: FIT,
    render: (_v, row) => <BillingRequestExecutedAtCell row={row} />,
  },
  {
    id: "cache",
    label: "Cache",
    align: "center",
    headerClassName: FIT,
    cellClassName: FIT,
    render: (_v, row) => formatBillingRequestCache(row.cache),
  },
  {
    id: "taskId",
    label: "Task ID",
    headerClassName: FIT,
    cellClassName: FIT,
    render: (_v, row) => <SupportToolsTaskIdCell taskId={row.taskId} />,
  },
];

export function BillingRequestConsultationsTab() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(EMPTY_REQUEST_CONSULTATION_FILTERS);

  const data = useMemo(
    () => filterRequestConsultationRows(billingRequestConsultationsMock, filters),
    [filters],
  );

  const hasFilters = hasActiveRequestConsultationFilters(filters);

  const summary = useMemo(() => computeConsultationBillableSummary(data), [data]);

  const clearFilters = () => {
    setFilters(EMPTY_REQUEST_CONSULTATION_FILTERS);
  };

  const exportCsv = () => {
    downloadSupportToolsCsv("consultas-requisicoes.csv", data, [
      { header: "Origem", value: (row) => row.origin },
      { header: "Cliente", value: (row) => row.clientName },
      { header: "ID cliente", value: (row) => String(row.clientId) },
      { header: "Usuário", value: (row) => row.username },
      { header: "ID usuário", value: (row) => String(row.userId) },
      { header: "Documento", value: (row) => row.document },
      { header: "Fontes", value: (row) => row.dataSourceName ?? "" },
      { header: "Franquia", value: (row) => row.franchiseName ?? "" },
      { header: "Service type", value: (row) => row.serviceType ?? "" },
      { header: "Código", value: (row) => String(row.statusCode) },
      {
        header: "Data/hora",
        value: (row) => formatBillingRequestDateTime(row.executedAt),
      },
      { header: "Cache", value: (row) => formatBillingRequestCache(row.cache) },
      { header: "Task ID", value: (row) => row.taskId ?? "" },
    ]);
  };

  return (
    <div className="space-y-4">
      <SupportToolsFiltersToolbar
        hasFilters={hasFilters}
        onOpenFilters={() => setIsFiltersOpen(true)}
        onClearFilters={clearFilters}
        onExportCsv={exportCsv}
      />

      <SupportToolsSummaryCards summary={summary} />

      <div className="overflow-x-auto">
        <DynamicTable
          columns={columns}
          data={data}
          keyExtractor={(row) => `${row.origin}-${row.id}`}
          layout="auto"
          classNames={{
            wrapper: "rounded-lg border border-gray-200 min-w-0 overflow-x-auto",
            table: "w-max min-w-full",
            td: "text-xs align-middle py-3",
            th: "text-xs",
          }}
        />
      </div>

      <BillingRequestConsultationsFiltersDrawer
        isOpen={isFiltersOpen}
        filters={filters}
        suggestionRows={billingRequestConsultationsMock}
        onOpenChange={setIsFiltersOpen}
        onApply={setFilters}
        onClear={clearFilters}
      />
    </div>
  );
}
