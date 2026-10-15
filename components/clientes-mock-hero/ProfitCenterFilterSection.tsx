"use client";

import { FieldCheckbox } from "@/design-system/ui";
import { PROFIT_CENTER_FILTER_BY_SALES_REP } from "../../clientesDashboardMockData";

interface ProfitCenterFilterSectionProps {
  checked: Record<string, boolean>;
  expandedReps: Record<string, boolean>;
  onToggleCheck: (id: string, value: boolean) => void;
  onToggleChecks: (updates: Record<string, boolean>) => void;
  onExpandedRepsChange: (next: Record<string, boolean>) => void;
}

export function ProfitCenterFilterSection({
  checked,
  expandedReps,
  onToggleCheck,
  onToggleChecks,
  onExpandedRepsChange,
}: ProfitCenterFilterSectionProps) {
  const handleRepToggle = (
    repId: string,
    value: boolean,
    childIds: string[],
  ) => {
    const childUpdates = Object.fromEntries(
      childIds.map((id) => [id, value]),
    ) as Record<string, boolean>;

    if (value) {
      onExpandedRepsChange({ ...expandedReps, [repId]: true });
      onToggleChecks({ [repId]: true, ...childUpdates });
      return;
    }
    onExpandedRepsChange({ ...expandedReps, [repId]: false });
    onToggleChecks({ [repId]: false, ...childUpdates });
  };

  return (
    <section className="mb-6">
      <span className="ds-section-title">Centros de lucro</span>
      <div className="flex flex-col gap-3">
        {PROFIT_CENTER_FILTER_BY_SALES_REP.map((rep) => {
          const childIds = rep.profitCenters.map((pc) => pc.id);
          const isExpanded = Boolean(expandedReps[rep.id]);

          return (
            <div key={rep.id}>
              <FieldCheckbox
                isSelected={Boolean(checked[rep.id])}
                onValueChange={(value) =>
                  handleRepToggle(rep.id, value, childIds)
                }
              >
                {rep.label}
              </FieldCheckbox>
              {isExpanded ? (
                <div className="mt-3 ml-6 flex flex-col gap-3 border-l border-gray-200 pl-3">
                  {rep.profitCenters.map((pc) => (
                    <FieldCheckbox
                      key={pc.id}
                      isSelected={Boolean(checked[pc.id])}
                      onValueChange={(value) => onToggleCheck(pc.id, value)}
                    >
                      {pc.label}
                    </FieldCheckbox>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
