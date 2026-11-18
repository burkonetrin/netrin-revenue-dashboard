import type {
  CostManagementMetrics,
  CostManagementRow,
  CostManagementWorkflowSplit,
} from "../types/costManagement.types";
import { workflowSplitMetricNumber } from "../utils/workflowSplitFormat";

export const API_PRODUCAO_BGCHECK_ID = "deductible-bgc-api-producao";

const API_PRODUCAO_WORKFLOW_SPLIT: CostManagementWorkflowSplit = {
  withWorkflow: {
    cost: "3742.65",
    revenue: "4500.00",
    billableConsultations: 240,
    nonBillableConsultations: 28,
    cacheConsultations: 12,
  },
  withoutWorkflow: {
    cost: "2495.10",
    revenue: "3000.00",
    billableConsultations: 160,
    nonBillableConsultations: 18,
    cacheConsultations: 8,
  },
};

function metricsFromWorkflowSplit(split: CostManagementWorkflowSplit): CostManagementMetrics {
  const { withWorkflow, withoutWorkflow } = split;
  const cost =
    workflowSplitMetricNumber(withWorkflow, "cost") +
    workflowSplitMetricNumber(withoutWorkflow, "cost");
  const revenue =
    workflowSplitMetricNumber(withWorkflow, "revenue") +
    workflowSplitMetricNumber(withoutWorkflow, "revenue");
  const directMargin = revenue - cost;
  const billableConsultations =
    withWorkflow.billableConsultations + withoutWorkflow.billableConsultations;
  const nonBillableConsultations =
    withWorkflow.nonBillableConsultations + withoutWorkflow.nonBillableConsultations;
  const cacheConsultations =
    withWorkflow.cacheConsultations + withoutWorkflow.cacheConsultations;

  return {
    cost: cost.toFixed(2),
    unitCost: billableConsultations > 0 ? (cost / billableConsultations).toFixed(4) : null,
    revenue: revenue.toFixed(2),
    unitRevenue: billableConsultations > 0 ? (revenue / billableConsultations).toFixed(4) : null,
    directMargin: directMargin.toFixed(2),
    directMarginPercent: revenue > 0 ? ((directMargin / revenue) * 100).toFixed(2) : "0",
    markup: cost > 0 ? (revenue / cost).toFixed(2) : null,
    billableConsultations,
    nonBillableConsultations,
    cacheConsultations,
    costVariationPercent: "5.4",
    revenueVariationPercent: "7.8",
    directMarginVariationPercent: "4.2",
    markupVariationPercent: "2.1",
    billableConsultationsVariationPercent: "10.5",
    nonBillableConsultationsVariationPercent: "-1.8",
    cacheConsultationsVariationPercent: "0.9",
  };
}

export function buildApiProducaoBackgroundCheckRow(
  contextLabel: string,
  nextLevelClickable: boolean,
): CostManagementRow {
  const prefix = contextLabel ? `${contextLabel} · ` : "";
  return {
    entity: {
      value: API_PRODUCAO_BGCHECK_ID,
      label: `${prefix}API Produção Background Check`,
    },
    rowKind: "entity",
    metrics: metricsFromWorkflowSplit(API_PRODUCAO_WORKFLOW_SPLIT),
    workflowSplit: API_PRODUCAO_WORKFLOW_SPLIT,
    isClickable: nextLevelClickable,
    client: null,
  };
}

export function apiProducaoBackgroundCheckLabel(value: string | null | undefined) {
  if (value === API_PRODUCAO_BGCHECK_ID) return "API Produção Background Check";
  return null;
}