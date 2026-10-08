"use client";

import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { useMemo, useState } from "react";
import { billingBankTransactionsMock } from "../mock/billingBankTransactions.mock";
import type { BillingBankTransactionRow } from "../types/billing-bank-transaction.types";
import { EMPTY_BANK_TRANSACTION_FILTERS } from "../types/support-tools-filters.types";
import {
  filterBankTransactionRows,
  hasActiveBankTransactionFilters,
} from "../utils/support-tools-filters.utils";
import { BillingBankTransactionsFiltersDrawer } from "./BillingBankTransactionsFiltersDrawer";
import { formatCurrency } from "@/shared/utils/currency";
import {
  BillingBankCell,
  BillingBankDocumentCell,
  BillingBankMicroDepositCell,
  BillingBankPixKeyCell,
  BillingBankSourceCell,
  BillingBankStatusCell,
  BillingBankTransactionDateCell,
  BillingBankTransactionValueCell,
} from "./BillingBankTransactionCells";
import { formatBankTransactionDateTime } from "../utils/billing-bank-transaction.utils";
import { downloadSupportToolsCsv } from "../utils/support-tools-csv-export.utils";
import { SupportToolsClientCell, SupportToolsUserCell } from "./support-tools/SupportToolsTableCells";
import { SupportToolsTaskIdCell } from "./support-tools/SupportToolsTaskIdCell";
import { SupportToolsFiltersToolbar } from "./support-tools/SupportToolsFiltersToolbar";
import {
  computeBankTransactionBillableSummary,
  SupportToolsSummaryCards,
} from "./support-tools/SupportToolsSummaryCards";

const FIT = "whitespace-nowrap w-[1%]";

const columns: ColumnConfig<BillingBankTransactionRow>[] = [
  {
    id: "id",
    label: "ID da consulta",
    headerClassName: FIT,
    cellClassName: FIT,
    render: (_v, row) => row.id,
  },
  {
    id: "microDepositStatus",
    label: "Micro depósito",
    headerClassName: FIT,
    cellClassName: FIT,
    render: (_v, row) => <BillingBankMicroDepositCell row={row} />,
  },
  {
    id: "statusCode",
    label: "Status",
    render: (_v, row) => <BillingBankStatusCell row={row} />,
  },
  {
    id: "executedAt",
    label: "Data/hora da transação",
    headerClassName: FIT,
    cellClassName: FIT,
    render: (_v, row) => <BillingBankTransactionDateCell row={row} />,
  },
  {
    id: "transactionValue",
    label: "Valor",
    headerClassName: FIT,
    cellClassName: FIT,
    render: (_v, row) => <BillingBankTransactionValueCell row={row} />,
  },
  {
    id: "sourceName",
    label: "Fonte",
    render: (_v, row) => <BillingBankSourceCell row={row} />,
  },
  {
    id: "origin",
    label: "Origem",
    headerClassName: FIT,
    cellClassName: FIT,
    render: (_v, row) => row.origin,
  },
  {
    id: "document",
    label: "Documento",
    headerClassName: FIT,
    cellClassName: FIT,
    render: (_v, row) => <BillingBankDocumentCell row={row} />,
  },
  {
    id: "pixKey",
    label: "Chave Pix",
    render: (_v, row) => <BillingBankPixKeyCell row={row} />,
  },
  {
    id: "bankCode",
    label: "Banco",
    headerClassName: FIT,
    cellClassName: FIT,
    render: (_v, row) => <BillingBankCell row={row} />,
  },
  {
    id: "clientName",
    label: "Cliente",
    render: (_v, row) => (
      <SupportToolsClientCell clientName={row.clientName} clientId={row.clientId} />
    ),
  },
  {
    id: "username",
    label: "Usuário",
    render: (_v, row) => <SupportToolsUserCell username={row.username} userId={row.userId} />,
  },
  {
    id: "taskId",
    label: "Task ID",
    headerClassName: FIT,
    cellClassName: FIT,
    render: (_v, row) => <SupportToolsTaskIdCell taskId={row.taskId} />,
  },
];

export function BillingBankTransactionsTab() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(EMPTY_BANK_TRANSACTION_FILTERS);

  const data = useMemo(
    () => filterBankTransactionRows(billingBankTransactionsMock, filters),
    [filters],
  );

  const hasFilters = hasActiveBankTransactionFilters(filters);

  const summary = useMemo(() => computeBankTransactionBillableSummary(data), [data]);

  const clearFilters = () => {
    setFilters(EMPTY_BANK_TRANSACTION_FILTERS);
  };

  const exportCsv = () => {
    downloadSupportToolsCsv("transacoes-bancarias.csv", data, [
      { header: "ID da consulta", value: (row) => String(row.id) },
      { header: "Micro depósito", value: (row) => row.microDepositStatus ?? "" },
      { header: "Erro microdepósito", value: (row) => row.microDepositErrorMessage ?? "" },
      { header: "Status", value: (row) => String(row.statusCode) },
      { header: "Mensagem", value: (row) => row.message ?? "" },
      { header: "Data/hora", value: (row) => formatBankTransactionDateTime(row.executedAt) },
      {
        header: "Tempo (ms)",
        value: (row) => (row.requestTimeMs != null ? String(row.requestTimeMs) : ""),
      },
      {
        header: "Valor",
        value: (row) =>
          row.transactionValue != null ? formatCurrency(row.transactionValue) : "",
      },
      {
        header: "Custo",
        value: (row) =>
          row.transactionCost != null ? formatCurrency(row.transactionCost) : "",
      },
      { header: "Fonte", value: (row) => row.sourceName },
      { header: "Fornecedor", value: (row) => row.provider },
      { header: "Origem", value: (row) => row.origin },
      { header: "Documento", value: (row) => row.document ?? "" },
      { header: "Titular", value: (row) => row.documentHolderName ?? "" },
      { header: "Chave Pix", value: (row) => row.pixKey ?? "" },
      { header: "Banco", value: (row) => row.bankCode ?? "" },
      { header: "Cliente", value: (row) => row.clientName },
      { header: "Usuário", value: (row) => row.username },
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
          keyExtractor={(row) => String(row.id)}
          layout="auto"
          classNames={{
            wrapper: "rounded-lg border border-gray-200 min-w-0 overflow-x-auto",
            table: "w-max min-w-full",
            td: "text-xs align-middle py-3",
            th: "text-xs",
          }}
        />
      </div>

      <BillingBankTransactionsFiltersDrawer
        isOpen={isFiltersOpen}
        filters={filters}
        suggestionRows={billingBankTransactionsMock}
        onOpenChange={setIsFiltersOpen}
        onApply={setFilters}
        onClear={clearFilters}
      />
    </div>
  );
}
