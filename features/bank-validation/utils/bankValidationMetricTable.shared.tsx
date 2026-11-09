"use client";

import { Tooltip } from "@heroui/react";
import type { ReactNode } from "react";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import type {
  BankValidationMetricValueType,
  BankValidationSourceInfo,
  BankValidationStatusCodeInfo,
} from "../types/bank-validation.types";
import { formatBankValidationMetricValue, getStatusCodeTooltip } from "./volumeMetrics";

/** Colunas fixas de fonte na tabela de métricas de bank validation. */
export const BANK_VALIDATION_FIXED_SOURCE_COLUMNS = [
  { key: "stark", label: "Stark" },
  { key: "trio", label: "Trio" },
] as const;

/** Normaliza o nome da fonte para comparação case-insensitive. */
export function normalizeBankValidationSourceName(value: string) {
  return value.trim().toLowerCase();
}

interface BankValidationMetricRow {
  label: string;
  valueType: BankValidationMetricValueType;
  codes: BankValidationStatusCodeInfo[];
  bySource: Record<string, number | undefined>;
}

/** Obtém o valor da métrica para a fonte informada na linha. */
export function getBankValidationSourceMetricValue(
  row: BankValidationMetricRow,
  sources: BankValidationSourceInfo[],
  sourceKey: string,
) {
  const normalizedSourceKey = normalizeBankValidationSourceName(sourceKey);
  const source = sources.find((item) =>
    [item.key, item.label].some(
      (value) => normalizeBankValidationSourceName(value) === normalizedSourceKey,
    ),
  );

  return row.bySource[source?.key ?? sourceKey];
}

/** Tooltip com códigos de status associados à métrica. */
export function MetricCodesTooltip({
  codes,
  children,
}: { codes: BankValidationStatusCodeInfo[]; children: ReactNode }) {
  return (
    <Tooltip
      content={
        <div className="space-y-3 py-1">
          {codes.map((code) => (
            <div key={code.statusCode} className="space-y-1 text-xs">
              <p>
                <span className="font-semibold">{code.statusCode}</span>
                <span>: </span>
                <span>{getStatusCodeTooltip(code)}</span>
              </p>
              <p>Categoria: {code.category || "-"}</p>
            </div>
          ))}
        </div>
      }
      placement="right"
      radius="sm"
    >
      <span className="font-semibold text-primary">{children}</span>
    </Tooltip>
  );
}

/** Label da métrica com códigos de status opcionais. */
export function BankValidationMetricLabel({ row }: { row: BankValidationMetricRow }) {
  if (row.codes.length === 0) {
    return <span className="text-default-800">{row.label}</span>;
  }

  return (
    <span className="text-default-800">
      {row.label}{" "}
      <MetricCodesTooltip codes={row.codes}>
        ({row.codes.map((code) => code.statusCode).join("/")})
      </MetricCodesTooltip>
    </span>
  );
}

/** Monta colunas (métrica, total e fontes) da tabela de bank validation. */
export function buildBankValidationSourceColumns<TRow extends BankValidationMetricRow>(
  sources: BankValidationSourceInfo[],
  formatTotal: (row: TRow) => string,
): ColumnConfig<TRow>[] {
  return [
    {
      id: "label",
      label: "Métrica",
      render: (_, row) => <BankValidationMetricLabel row={row} />,
    },
    {
      id: "total",
      label: "Total",
      render: (_, row) => formatTotal(row),
    },
    ...BANK_VALIDATION_FIXED_SOURCE_COLUMNS.map<ColumnConfig<TRow>>((source) => ({
      id: `source:${source.key}`,
      label: source.label,
      render: (_, row) =>
        formatBankValidationMetricValue(
          getBankValidationSourceMetricValue(row, sources, source.key),
          row.valueType,
        ),
    })),
  ];
}
