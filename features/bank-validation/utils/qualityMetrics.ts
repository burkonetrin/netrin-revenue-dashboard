/**
 * Utilitários para montar cards e linhas das métricas de qualidade bancária.
 */

import {
  BANK_VALIDATION_QUALITY_BILLABLE_METRIC_ORDER,
  BANK_VALIDATION_QUALITY_COMPLETED_METRIC_ORDER,
  BANK_VALIDATION_QUALITY_METRIC_LABELS,
} from "../constants/bank-validation.constants";
import type {
  BankValidationMetricValueType,
  BankValidationTransactionQualityMetricKey,
  BankValidationTransactionQualityMetrics,
  BankValidationTransactionQualityRatio,
  BankValidationTransactionQualityRow,
  BankValidationTransactionQualitySummaryCard,
} from "../types/bank-validation.types";
import { formatBankValidationMetricValue, orderBankValidationStatusCodes } from "./volumeMetrics";

const ratioByMetric: Partial<
  Record<
    BankValidationTransactionQualityMetricKey,
    {
      ratioKey: BankValidationTransactionQualityMetricKey;
      denominatorLabel: BankValidationTransactionQualityRatio["denominatorLabel"];
    }
  >
> = {
  invalidParams: {
    ratioKey: "invalidParamsBillableRatio",
    denominatorLabel: "bilhetadas",
  },
  keyNotBelongs: {
    ratioKey: "keyNotBelongsBillableRatio",
    denominatorLabel: "bilhetadas",
  },
  completedRequests: {
    ratioKey: "completedRequestsBillableRatio",
    denominatorLabel: "bilhetadas",
  },
  validAccounts: {
    ratioKey: "validAccountsCompletedRatio",
    denominatorLabel: "efetivadas",
  },
  invalidAccounts: {
    ratioKey: "invalidAccountsCompletedRatio",
    denominatorLabel: "efetivadas",
  },
};

/**
 * Monta os cards resumo com totais de requisições por fonte.
 */
export function buildBankValidationQualitySummaryCards(
  metrics: BankValidationTransactionQualityMetrics,
): BankValidationTransactionQualitySummaryCard[] {
  return [
    {
      id: "totalRequests",
      label: "Total requisições",
      value: metrics.totalRequests.total,
    },
    {
      id: "starkRequests",
      label: "Requisições Stark",
      value: metrics.totalRequests.bySource.stark,
    },
    {
      id: "trioRequests",
      label: "Requisições Trio",
      value: metrics.totalRequests.bySource.trio,
    },
  ];
}

/**
 * Monta as linhas da tabela de requisições bilhetadas.
 */
export function buildBankValidationQualityBillableRows(
  metrics: BankValidationTransactionQualityMetrics,
): BankValidationTransactionQualityRow[] {
  return buildBankValidationQualityRows(
    metrics,
    BANK_VALIDATION_QUALITY_BILLABLE_METRIC_ORDER,
    true,
  );
}

/**
 * Monta as linhas da tabela de requisições efetivadas.
 */
export function buildBankValidationQualityCompletedRows(
  metrics: BankValidationTransactionQualityMetrics,
): BankValidationTransactionQualityRow[] {
  return buildBankValidationQualityRows(
    metrics,
    BANK_VALIDATION_QUALITY_COMPLETED_METRIC_ORDER,
    false,
  );
}

function buildBankValidationQualityRows(
  metrics: BankValidationTransactionQualityMetrics,
  order: readonly BankValidationTransactionQualityMetricKey[],
  includeCompletedRequestsRatio: boolean,
): BankValidationTransactionQualityRow[] {
  return order.map((key) => {
    const metric = metrics[key];

    return {
      id: key,
      label: BANK_VALIDATION_QUALITY_METRIC_LABELS[key] || metric.label,
      codes: key === "billable" ? [] : orderBankValidationStatusCodes(metric.codes),
      total: metric.total,
      bySource: metric.bySource,
      valueType: getQualityMetricValueType(key),
      ratio: getQualityMetricRatio(metrics, key, includeCompletedRequestsRatio),
    };
  });
}

function getQualityMetricValueType(
  key: BankValidationTransactionQualityMetricKey,
): BankValidationMetricValueType {
  if (key === "avgTime") {
    return "seconds";
  }

  return "number";
}

function getQualityMetricRatio(
  metrics: BankValidationTransactionQualityMetrics,
  key: BankValidationTransactionQualityMetricKey,
  includeCompletedRequestsRatio: boolean,
): BankValidationTransactionQualityRatio | undefined {
  if (key === "completedRequests" && !includeCompletedRequestsRatio) {
    return undefined;
  }

  const ratioConfig = ratioByMetric[key];

  if (!ratioConfig) {
    return undefined;
  }

  const ratioMetric = metrics[ratioConfig.ratioKey];

  return {
    total: ratioMetric.total,
    bySource: ratioMetric.bySource,
    denominatorLabel: ratioConfig.denominatorLabel,
  };
}

/**
 * Formata o valor total de uma linha de qualidade com taxa percentual opcional.
 */
export function formatBankValidationQualityTotalValue(
  row: BankValidationTransactionQualityRow,
): string {
  const value = formatBankValidationMetricValue(row.total, row.valueType);

  if (!row.ratio) {
    return value;
  }

  const ratio = formatBankValidationMetricValue(row.ratio.total, "percentage");

  return `${value} - ${ratio} das ${row.ratio.denominatorLabel}`;
}
