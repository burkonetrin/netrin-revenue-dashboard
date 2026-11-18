"use client";

import { TOOLTIP_BODY_CLASS, TOOLTIP_TITLE_CLASS } from "@/shared/constants/tooltip.constants";
import type { CostManagementWorkflowMetricSplit } from "../types/costManagement.types";
import { formatWorkflowSplitMetricValue } from "../utils/workflowSplitFormat";

export function FinancialWorkflowSplitTooltipContent({
  metricKey,
  kind,
  withWorkflow,
  withoutWorkflow,
}: {
  metricKey: string;
  kind: "currency" | "currency4" | "count" | "percent" | "decimal";
  withWorkflow: CostManagementWorkflowMetricSplit;
  withoutWorkflow: CostManagementWorkflowMetricSplit;
}) {
  return (
    <div className={`flex flex-col gap-3 px-2 py-1 ${TOOLTIP_BODY_CLASS}`}>
      <div className="flex flex-col gap-0.5">
        <span className={TOOLTIP_TITLE_CLASS}>Com Workflow</span>
        <span>{formatWorkflowSplitMetricValue(withWorkflow, metricKey, kind)}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className={TOOLTIP_TITLE_CLASS}>Sem Workflow</span>
        <span>{formatWorkflowSplitMetricValue(withoutWorkflow, metricKey, kind)}</span>
      </div>
    </div>
  );
}