"use client";

import { formatCurrency } from "@/shared/utils/currency";
import { TOOLTIP_BODY_CLASS, TOOLTIP_TITLE_CLASS } from "@/shared/constants/tooltip.constants";
import type { BillingFranchiseConsumptionInfo } from "../types/billing-detail.types";

function formatConsultations(count: number) {
  return count.toLocaleString("pt-BR");
}

/** Conteúdo da tooltip de consultas Workflow (hierarquia ou split). */
export function BillingFranchiseConsumptionInfoTooltipContent({
  info,
}: {
  info: BillingFranchiseConsumptionInfo;
}) {
  if (info.kind === "workflow_hierarchy") {
    return (
      <div className={`flex flex-col gap-3 px-2 py-1 ${TOOLTIP_BODY_CLASS}`}>
        {info.entries.map((entry) => (
          <div key={entry.franchiseName} className="flex flex-col gap-0.5">
            <span className={TOOLTIP_TITLE_CLASS}>{entry.franchiseName}</span>
            <span>
              {formatConsultations(entry.consultations)} consultas
              {entry.billedAmount != null
                ? ` · ${formatCurrency(entry.billedAmount)}`
                : null}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1.5 px-2 py-1 ${TOOLTIP_BODY_CLASS}`}>
      <div className="flex flex-col gap-0.5">
        <span className={TOOLTIP_TITLE_CLASS}>Consultas por Workflow</span>
        <span>
          {formatConsultations(info.workflowConsultations)}
          {info.workflowBilledAmount != null
            ? ` · ${formatCurrency(info.workflowBilledAmount)}`
            : null}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className={TOOLTIP_TITLE_CLASS}>Consultas sem Workflow</span>
        <span>
          {formatConsultations(info.outsideWorkflowConsultations)}
          {info.outsideWorkflowBilledAmount != null
            ? ` · ${formatCurrency(info.outsideWorkflowBilledAmount)}`
            : null}
        </span>
      </div>
    </div>
  );
}