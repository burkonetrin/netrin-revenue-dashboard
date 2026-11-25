"use client";

/**
 * Tabela de volume geral das transações bancárias por mês de competência.
 */

import { DynamicTable } from "@/shared/components/DynamicTable";
import { useMemo, useState } from "react";
import { useBankValidationMetricErrorToast } from "../hooks/useBankValidationMetricErrorToast";
import { useBankValidationTransactionQuality } from "../hooks/useBankValidationTransactionQuality";
import { useBankValidationVolume } from "../hooks/useBankValidationVolume";
import type { BankValidationVolumeRow } from "../types/bank-validation.types";
import { buildBankValidationSourceColumns } from "../utils/bankValidationMetricTable.shared";
import {
  buildBankValidationQualityBillableRows,
  buildBankValidationQualityCompletedRows,
} from "../utils/qualityMetrics";
import {
  buildBankValidationVolumeRows,
  formatBankValidationMetricValue,
} from "../utils/volumeMetrics";
import {
  BANK_VALIDATION_NESTED_EXPAND_CLASS,
  BankValidationNestedMetricTable,
} from "./BankValidationNestedMetricTable";

interface BankValidationVolumeTableProps {
  referenceMonth: string;
  /** Exibe detalhes de qualidade aninhados nas linhas Bilhetadas (aba Dados bancários). */
  withNestedQualityDetails?: boolean;
}

function buildColumns(sources: Parameters<typeof buildBankValidationSourceColumns>[0]) {
  return buildBankValidationSourceColumns<BankValidationVolumeRow>(
    sources,
    (row) => formatBankValidationMetricValue(row.total, row.valueType),
  );
}

/**
 * Exibe métricas de volume geral de transações bancárias.
 */
export function BankValidationVolumeTable({
  referenceMonth,
  withNestedQualityDetails = false,
}: Readonly<BankValidationVolumeTableProps>) {
  const { data, isLoading, error } = useBankValidationVolume({
    referenceMonth,
  });

  const {
    data: qualityData,
    isLoading: isQualityLoading,
    error: qualityError,
  } = useBankValidationTransactionQuality({
    referenceMonth,
  });

  const [volumeExpandedRowKeys, setVolumeExpandedRowKeys] = useState<Set<string | number>>(
    new Set(),
  );

  const rows = useMemo(() => (data ? buildBankValidationVolumeRows(data.metrics) : []), [data]);

  const billableRows = useMemo(
    () => (qualityData ? buildBankValidationQualityBillableRows(qualityData.metrics) : []),
    [qualityData],
  );

  const completedRows = useMemo(
    () => (qualityData ? buildBankValidationQualityCompletedRows(qualityData.metrics) : []),
    [qualityData],
  );

  const sources = data?.sources ?? qualityData?.sources ?? [];
  const columns = useMemo(() => buildColumns(sources), [sources]);
  const emptyMessage = `Nenhum dado encontrado para ${referenceMonth}`;
  const tableIsLoading = isLoading || (withNestedQualityDetails && isQualityLoading);

  useBankValidationMetricErrorToast(
    referenceMonth,
    error,
    "Erro ao carregar volume geral",
    "Erro ao carregar volume geral. Tente novamente.",
  );

  useBankValidationMetricErrorToast(
    referenceMonth,
    withNestedQualityDetails ? qualityError : undefined,
    "Erro ao carregar qualidade das transações",
    "Erro ao carregar qualidade das transações. Tente novamente.",
  );

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <DynamicTable
            layout="fixed"
            columns={columns}
            data={rows}
            emptyMessage={emptyMessage}
            isLoading={tableIsLoading}
            keyExtractor={(row) => row.id}
            expandable={withNestedQualityDetails}
            expandButtonLabel="métrica"
            isRowExpandable={(row) => withNestedQualityDetails && row.id === "billable"}
            isRowClickable={(row) => withNestedQualityDetails && row.id === "billable"}
            expandedRowKeys={volumeExpandedRowKeys}
            onExpandedChange={(key, isExpanded) => {
              setVolumeExpandedRowKeys((previous) => {
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
              withNestedQualityDetails
                ? () => (
                    <BankValidationNestedMetricTable
                      rows={billableRows}
                      sources={sources}
                      metricColumnLabel="Requisições bilhetadas"
                      excludeRowIds={["billable"]}
                      isLoading={isQualityLoading}
                      emptyMessage={emptyMessage}
                      nestedExpand={{
                        rowId: "completedRequests",
                        metricColumnLabel: "Requisições efetivadas",
                        rows: completedRows,
                        excludeRowIds: ["completedRequests"],
                      }}
                    />
                  )
                : undefined
            }
            expandedContentClassName={BANK_VALIDATION_NESTED_EXPAND_CLASS}
            classNames={{
              th: "bg-gray-50 text-gray-700 font-semibold text-xs",
              td: "text-gray-900 border-b border-gray-200 h-12 text-xs",
            }}
          />
        </div>
      </div>
    </div>
  );
}