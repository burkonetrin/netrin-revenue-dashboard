import type { CostManagementWorkflowMetricSplit } from "../types/costManagement.types";
import {
  formatCount,
  formatCurrency,
  formatDecimal,
  formatPercent,
} from "./financialFormatters";

export function workflowSplitMetricNumber(
  split: CostManagementWorkflowMetricSplit,
  metricKey: string,
): number {
  const cost = Number(split.cost);
  const revenue = Number(split.revenue);
  const billable = split.billableConsultations;
  const directMargin = revenue - cost;

  switch (metricKey) {
    case "cost":
      return cost;
    case "revenue":
      return revenue;
    case "directMargin":
      return directMargin;
    case "markup":
      return cost > 0 ? revenue / cost : 0;
    case "billableConsultations":
      return billable;
    case "nonBillableConsultations":
      return split.nonBillableConsultations;
    case "cacheConsultations":
      return split.cacheConsultations;
    case "unitCost":
      return billable > 0 ? cost / billable : 0;
    case "unitRevenue":
      return billable > 0 ? revenue / billable : 0;
    case "directMarginPercent":
      return revenue > 0 ? (directMargin / revenue) * 100 : 0;
    default:
      return 0;
  }
}

export function formatWorkflowSplitMetricValue(
  split: CostManagementWorkflowMetricSplit,
  metricKey: string,
  kind: "currency" | "currency4" | "count" | "percent" | "decimal",
): string {
  const value = workflowSplitMetricNumber(split, metricKey);
  if (kind === "count") return formatCount(Math.round(value));
  if (kind === "percent") return formatPercent(String(value)) ?? String(value);
  if (kind === "decimal") return formatDecimal(String(value)) ?? String(value);
  if (kind === "currency4") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(value);
  }
  return formatCurrency(String(value)) ?? String(value);
}

export function sumWorkflowSplitMetric(
  withWorkflow: CostManagementWorkflowMetricSplit,
  withoutWorkflow: CostManagementWorkflowMetricSplit,
  metricKey: string,
): number {
  return (
    workflowSplitMetricNumber(withWorkflow, metricKey) +
    workflowSplitMetricNumber(withoutWorkflow, metricKey)
  );
}