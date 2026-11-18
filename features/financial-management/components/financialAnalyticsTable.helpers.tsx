import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import type { ReactNode } from "react";
import { formatCurrency4 } from "@/shared/utils/currency";
import { Tooltip } from "@heroui/react";
import { Info, TrendingDown, TrendingUp } from "lucide-react";
import type {
  CostManagementLevel,
  CostManagementLevelResult,
  CostManagementMetrics,
  CostManagementRow,
} from "../types/costManagement.types";
import { isManualInvoiceRow } from "../utils/financialAccordion";
import {
  formatCount,
  formatCurrency,
  formatDecimal,
  formatPercent,
  getVariationPresentation,
} from "../utils/financialFormatters";
import { FinancialWorkflowSplitTooltipContent } from "./FinancialWorkflowSplitTooltip";

export const financialLevelLabels: Record<CostManagementLevel, string> = {
  client: "Clientes",
  product: "Produtos",
  background_check_model: "Modelos Background Check",
  workflow_child_deductible: "Franquias Workflow (filhas)",
  deductible: "Franquias",
  data_source: "Fontes",
  provider: "Fornecedores",
};

export type FinancialTableRow = CostManagementRow & { isTotal?: boolean };

export function buildTableRows(
  result: CostManagementLevelResult,
  includeTotal = true,
): FinancialTableRow[] {
  void includeTotal;
  return result.rows.data;
}

export function isDrillableRow(row: FinancialTableRow, result: CostManagementLevelResult) {
  if (row.rowKind === "workflow_parent") return false;
  return !row.isTotal && !isManualInvoiceRow(row) && row.isClickable && !result.isLastLevel;
}

const WORKFLOW_SPLIT_METRIC_KEYS = new Set([
  "cost",
  "revenue",
  "billableConsultations",
  "nonBillableConsultations",
  "cacheConsultations",
  "unitCost",
  "unitRevenue",
]);

function MetricValue({
  value,
  variation,
  secondaryValue,
  showVariation,
  manualInvoiceRevenue,
  manualInvoiceTooltipLabel,
  workflowSplit,
  workflowMetricKey,
  kind = "currency",
  secondaryKind = "currency",
}: {
  value: string | number | null | undefined;
  variation?: string | null;
  secondaryValue?: string | number | null | undefined;
  showVariation: boolean;
  manualInvoiceRevenue?: string | null;
  manualInvoiceTooltipLabel?: string;
  workflowSplit?: CostManagementRow["workflowSplit"];
  workflowMetricKey?: string;
  kind?: "currency" | "currency4" | "count" | "percent" | "decimal";
  secondaryKind?: "currency" | "count" | "percent";
}) {
  const formatted =
    value === null || value === undefined
      ? "—"
      : kind === "count"
        ? formatCount(Number(value))
        : kind === "decimal"
          ? formatDecimal(String(value))
          : kind === "percent"
            ? formatPercent(String(value))
            : kind === "currency4"
              ? formatCurrency4(String(value))
              : formatCurrency(String(value));
  const secondaryFormatted =
    secondaryValue === null || secondaryValue === undefined
      ? null
      : secondaryKind === "count"
        ? formatCount(Number(secondaryValue))
        : secondaryKind === "percent"
          ? formatPercent(String(secondaryValue))
          : formatCurrency(String(secondaryValue));
  const presentation = getVariationPresentation(variation ?? null);
  const manualRevenueValue =
    manualInvoiceRevenue === null || manualInvoiceRevenue === undefined
      ? null
      : Number(manualInvoiceRevenue);
  const hasManualInvoiceRevenue =
    manualRevenueValue !== null && Number.isFinite(manualRevenueValue) && manualRevenueValue > 0;
  const hasWorkflowSplitTooltip = Boolean(
    workflowSplit &&
      workflowMetricKey &&
      WORKFLOW_SPLIT_METRIC_KEYS.has(workflowMetricKey),
  );

  const infoTooltipButton = (tooltip: ReactNode, ariaLabel: string) => (
    <Tooltip content={tooltip} placement="top" showArrow radius="md">
      <button
        type="button"
        aria-label={ariaLabel}
        className="shrink-0 self-center text-[#00a3ff]"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <Info size={16} aria-hidden />
      </button>
    </Tooltip>
  );

  return (
    <div className="text-xs text-default-700">
      <div className="flex items-center gap-1">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1">
            <span>{formatted ?? "—"}</span>
            {showVariation && presentation !== "hidden" ? (
              <span
                className={`inline-flex items-center gap-1 text-xs ${presentation === "increase" ? "text-success-600" : "text-danger-500"}`}
              >
                {presentation === "increase" ? (
                  <TrendingUp size={14} aria-hidden />
                ) : (
                  <TrendingDown size={14} aria-hidden />
                )}
                {formatPercent(variation ?? null)}
              </span>
            ) : null}
          </div>
          {secondaryFormatted ? (
            <span className="block text-xs text-default-500">
              {secondaryFormatted}
              {secondaryKind === "currency" ? " un." : ""}
            </span>
          ) : null}
        </div>
        {hasManualInvoiceRevenue
          ? infoTooltipButton(
              `Faturas manuais incluídas na receita: ${formatCurrency(String(manualInvoiceRevenue))}`,
              manualInvoiceTooltipLabel ?? "Informações sobre faturas manuais",
            )
          : null}
        {hasWorkflowSplitTooltip ? (
          infoTooltipButton(
            <FinancialWorkflowSplitTooltipContent
              metricKey={workflowMetricKey!}
              kind={kind}
              withWorkflow={workflowSplit!.withWorkflow}
              withoutWorkflow={workflowSplit!.withoutWorkflow}
            />,
            "Com Workflow e Sem Workflow",
          )
        ) : null}
      </div>
    </div>
  );
}

export function getFinancialColumns(
  level: CostManagementLevel,
  showVariations: boolean,
): ColumnConfig<FinancialTableRow>[] {
  const metric = (
    label: string,
    key: keyof CostManagementMetrics,
    variation?: keyof CostManagementMetrics,
    kind?: "currency" | "currency4" | "count" | "percent" | "decimal",
    secondaryKey?: keyof CostManagementMetrics,
    secondaryKind?: "currency" | "count" | "percent",
  ): ColumnConfig<FinancialTableRow> => ({
    id: key,
    label,
    align: "start",
    cellClassName: "text-left",
    sortable: true,
    render: (_, row) =>
      isManualInvoiceRow(row) && key !== "revenue" ? null : (
        <MetricValue
          value={row.metrics[key] as string | number | null | undefined}
          variation={variation ? (row.metrics[variation] as string | null | undefined) : null}
          secondaryValue={
            secondaryKey ? (row.metrics[secondaryKey] as string | number | null | undefined) : null
          }
          manualInvoiceRevenue={key === "revenue" ? row.metrics.manualInvoiceRevenue : null}
          manualInvoiceTooltipLabel={`Informações sobre faturas manuais incluídas na receita de ${row.entity.label}`}
          workflowSplit={row.workflowSplit}
          workflowMetricKey={String(key)}
          showVariation={isManualInvoiceRow(row) ? false : showVariations}
          kind={kind}
          secondaryKind={secondaryKind}
        />
      ),
  });
  const columns: ColumnConfig<FinancialTableRow>[] = [
    {
      id: "name",
      label: "Nome",
      align: "start",
      cellClassName: "text-left",
      render: (_, row) => (
        <span className="whitespace-normal wrap-break-word text-xs font-medium text-default-700">
          {row.entity.label}
        </span>
      ),
    },
    metric("Custo", "cost", "costVariationPercent", "currency", "unitCost"),
    metric("Receita", "revenue", "revenueVariationPercent", "currency", "unitRevenue"),
    metric(
      "Margem direta",
      "directMargin",
      "directMarginVariationPercent",
      "currency",
      "directMarginPercent",
      "percent",
    ),
    metric("Markup", "markup", "markupVariationPercent", "decimal"),
    metric(
      "Consultas bilhetadas",
      "billableConsultations",
      "billableConsultationsVariationPercent",
      "count",
    ),
    metric(
      "Consultas não bilhetadas",
      "nonBillableConsultations",
      "nonBillableConsultationsVariationPercent",
      "count",
    ),
    metric("Cache", "cacheConsultations", "cacheConsultationsVariationPercent", "count"),
  ];
  if (level === "data_source") {
    columns.splice(2, 0, metric("Custo de referência", "defaultCost", undefined, "currency4"));
  }
  return columns;
}

export function getProjectsManualColumns(): ColumnConfig<FinancialTableRow>[] {
  return [
    {
      id: "name",
      label: "Nome",
      align: "start",
      cellClassName: "text-left",
      render: (_, row) => (
        <span className="whitespace-normal wrap-break-word text-xs font-medium text-default-700">
          {row.entity.label}
        </span>
      ),
    },
    {
      id: "revenue",
      label: "Receita",
      align: "start",
      cellClassName: "text-left",
      render: (_, row) => formatCurrency(row.metrics.revenue ?? "0") ?? "—",
    },
    {
      id: "client",
      label: "Cliente",
      align: "start",
      cellClassName: "text-left",
      render: (_, row) => row.client?.label ?? "—",
    },
  ];
}