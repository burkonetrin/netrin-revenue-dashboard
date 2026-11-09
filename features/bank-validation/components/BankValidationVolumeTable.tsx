"use client";

/**
 * Tabela de volume geral das transações bancárias por mês de competência.
 */

import { useMemo } from "react";
import { DynamicTable } from "@/shared/components/DynamicTable";
import { useBankValidationMetricErrorToast } from "../hooks/useBankValidationMetricErrorToast";
import { useBankValidationVolume } from "../hooks/useBankValidationVolume";
import type { BankValidationVolumeRow } from "../types/bank-validation.types";
import { buildBankValidationSourceColumns } from "../utils/bankValidationMetricTable.shared";
import {
  buildBankValidationVolumeRows,
  formatBankValidationMetricValue,
} from "../utils/volumeMetrics";

interface BankValidationVolumeTableProps {
  referenceMonth: string;
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
}: Readonly<BankValidationVolumeTableProps>) {
  const { data, isLoading, error } = useBankValidationVolume({
    referenceMonth,
  });

  const rows = useMemo(() => (data ? buildBankValidationVolumeRows(data.metrics) : []), [data]);

  const columns = useMemo(() => buildColumns(data?.sources ?? []), [data?.sources]);

  useBankValidationMetricErrorToast(
    referenceMonth,
    error,
    "Erro ao carregar volume geral",
    "Erro ao carregar volume geral. Tente novamente.",
  );

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <DynamicTable
            columns={columns}
            data={rows}
            emptyMessage={`Nenhum dado encontrado para ${referenceMonth}`}
            isLoading={isLoading}
            keyExtractor={(row) => row.id}
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
