"use client";

/**
 * Painel de qualidade das transações bancárias por mês de competência.
 */

import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { Skeleton } from "@heroui/react";
import { useMemo } from "react";
import { useBankValidationMetricErrorToast } from "../hooks/useBankValidationMetricErrorToast";
import { useBankValidationTransactionQuality } from "../hooks/useBankValidationTransactionQuality";
import type {
  BankValidationTransactionQualityRow,
  BankValidationTransactionQualitySummaryCard,
} from "../types/bank-validation.types";
import { buildBankValidationSourceColumns } from "../utils/bankValidationMetricTable.shared";
import {
  buildBankValidationQualityBillableRows,
  buildBankValidationQualityCompletedRows,
  buildBankValidationQualitySummaryCards,
  formatBankValidationQualityTotalValue,
} from "../utils/qualityMetrics";
import { formatBankValidationMetricValue } from "../utils/volumeMetrics";

interface BankValidationTransactionQualityProps {
  referenceMonth: string;
  showSummaryCards?: boolean;
}

const summaryCardPlaceholders: BankValidationTransactionQualitySummaryCard[] = [
  {
    id: "totalRequests",
    label: "Total requisições",
  },
  {
    id: "starkRequests",
    label: "Requisições Stark",
  },
  {
    id: "trioRequests",
    label: "Requisições Trio",
  },
];

function buildColumns(
  sources: Parameters<typeof buildBankValidationSourceColumns>[0],
) {
  return buildBankValidationSourceColumns<BankValidationTransactionQualityRow>(
    sources,
    formatBankValidationQualityTotalValue,
  );
}

function formatSummaryValue(value: number | undefined) {
  if (value === undefined) {
    return "-";
  }

  return formatBankValidationMetricValue(value, "number");
}

/**
 * Cards resumo com totais de requisições por fonte.
 */
function QualitySummaryCards({
  cards,
  isLoading,
}: {
  cards: BankValidationTransactionQualitySummaryCard[];
  isLoading: boolean;
}) {
  return (
    <div className="grid max-w-[555px] grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.id} className="min-h-16 rounded-md bg-blue-50/60 px-4 py-3">
          <p className="text-xs text-default-500">{card.label}</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-6 w-24 rounded-md" />
          ) : (
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {formatSummaryValue(card.value)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Seção de tabela para um grupo de métricas de qualidade.
 */
function QualityTableSection({
  title,
  rows,
  columns,
  emptyMessage,
  isLoading,
}: {
  title: string;
  rows: BankValidationTransactionQualityRow[];
  columns: ColumnConfig<BankValidationTransactionQualityRow>[];
  emptyMessage: string;
  isLoading: boolean;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-medium text-default-700">{title}</h2>
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <DynamicTable
            columns={columns}
            data={rows}
            emptyMessage={emptyMessage}
            isLoading={isLoading}
            keyExtractor={(row) => row.id}
            classNames={{
              th: "bg-gray-50 text-gray-700 font-semibold text-xs",
              td: "text-gray-900 border-b border-gray-200 h-12 text-xs",
            }}
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Exibe métricas de qualidade de transações bilhetadas e efetivadas.
 */
export function BankValidationTransactionQuality({
  referenceMonth,
  showSummaryCards = true,
}: Readonly<BankValidationTransactionQualityProps>) {
  const { data, isLoading, error } = useBankValidationTransactionQuality({
    referenceMonth,
  });

  const summaryCards = useMemo(
    () => (data ? buildBankValidationQualitySummaryCards(data.metrics) : summaryCardPlaceholders),
    [data],
  );

  const billableRows = useMemo(
    () => (data ? buildBankValidationQualityBillableRows(data.metrics) : []),
    [data],
  );

  const completedRows = useMemo(
    () => (data ? buildBankValidationQualityCompletedRows(data.metrics) : []),
    [data],
  );

  const columns = useMemo(() => buildColumns(data?.sources ?? []), [data?.sources]);

  useBankValidationMetricErrorToast(
    referenceMonth,
    error,
    "Erro ao carregar qualidade das transações",
    "Erro ao carregar qualidade das transações. Tente novamente.",
  );

  const emptyMessage = `Nenhum dado encontrado para ${referenceMonth}`;

  return (
    <>
      {showSummaryCards && <QualitySummaryCards cards={summaryCards} isLoading={isLoading} />}

      <QualityTableSection
        title="Requisições bilhetadas"
        rows={billableRows}
        columns={columns}
        emptyMessage={emptyMessage}
        isLoading={isLoading}
      />

      <QualityTableSection
        title="Requisições bilhetadas efetivadas"
        rows={completedRows}
        columns={columns}
        emptyMessage={emptyMessage}
        isLoading={isLoading}
      />
    </>
  );
}
