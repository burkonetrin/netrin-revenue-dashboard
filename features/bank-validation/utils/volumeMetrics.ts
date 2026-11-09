/**
 * Utilitários para montar e formatar métricas de volume bancário.
 */

import {
  BANK_VALIDATION_PERCENTAGE_METRICS,
  BANK_VALIDATION_STATUS_CODE_DISPLAY_ORDER,
  BANK_VALIDATION_STATUS_CODE_TOOLTIPS,
  BANK_VALIDATION_VOLUME_METRIC_LABELS,
  BANK_VALIDATION_VOLUME_METRIC_ORDER,
} from "../constants/bank-validation.constants";
import type {
  BankValidationMetricValueType,
  BankValidationStatusCodeInfo,
  BankValidationVolumeRow,
  BankValidationVolumetryMetrics,
} from "../types/bank-validation.types";

const percentageMetrics = new Set(BANK_VALIDATION_PERCENTAGE_METRICS);
const statusCodeDisplayOrder = new Map<number, number>(
  BANK_VALIDATION_STATUS_CODE_DISPLAY_ORDER.map((statusCode, index) => [statusCode, index]),
);

/**
 * Converte métricas da API em linhas da tabela de volume.
 */
export function buildBankValidationVolumeRows(
  metrics: BankValidationVolumetryMetrics,
): BankValidationVolumeRow[] {
  return BANK_VALIDATION_VOLUME_METRIC_ORDER.map((key) => {
    const metric = metrics[key];

    return {
      id: key,
      label: BANK_VALIDATION_VOLUME_METRIC_LABELS[key] || metric.label,
      codes: orderBankValidationStatusCodes(metric.codes),
      total: metric.total,
      bySource: metric.bySource,
      valueType: percentageMetrics.has(key) ? "percentage" : "number",
    };
  });
}

/**
 * Ordena códigos de status conforme a ordem de exibição definida.
 */
export function orderBankValidationStatusCodes(
  codes: BankValidationStatusCodeInfo[],
): BankValidationStatusCodeInfo[] {
  return [...codes].sort((current, next) => {
    const currentOrder = statusCodeDisplayOrder.get(current.statusCode) ?? Number.MAX_SAFE_INTEGER;
    const nextOrder = statusCodeDisplayOrder.get(next.statusCode) ?? Number.MAX_SAFE_INTEGER;

    if (currentOrder !== nextOrder) {
      return currentOrder - nextOrder;
    }

    return current.statusCode - next.statusCode;
  });
}

/**
 * Formata valor numérico, percentual ou em segundos para exibição.
 */
export function formatBankValidationMetricValue(
  value: number | undefined,
  valueType: BankValidationMetricValueType,
): string {
  if (value === undefined || !Number.isFinite(value)) {
    if (valueType === "percentage") {
      return "0%";
    }

    if (valueType === "seconds") {
      return "0s";
    }

    return "0";
  }

  if (valueType === "percentage") {
    const percentage = Math.abs(value) <= 1 ? value * 100 : value;
    return `${percentage.toLocaleString("pt-BR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    })}%`;
  }

  if (valueType === "seconds") {
    return `${value.toLocaleString("pt-BR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    })}s`;
  }

  return value.toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

/**
 * Retorna a descrição do código de status para tooltip.
 */
export function getStatusCodeTooltip(code: BankValidationStatusCodeInfo): string {
  return (
    code.description ||
    BANK_VALIDATION_STATUS_CODE_TOOLTIPS[code.statusCode] ||
    `Código ${code.statusCode}`
  );
}
