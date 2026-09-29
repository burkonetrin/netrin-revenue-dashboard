"use client";

import { useMemo, useState } from "react";
import { FieldSelect } from "@/design-system/ui";
import { COHORT, COHORT_OFFSETS } from "../../clientesDashboardMockData";
import { fmtMil } from "../../clientesDashboardMockFormat";
import {
  nucleusTableHeadCellCenterClass,
  nucleusTableHeadCellClass,
} from "@/shared/styles/tableClassNames";

type CohortMetric = "retention" | "mrr";

const METRIC_OPTIONS = [
  { key: "retention", label: "Retenção" },
  { key: "mrr", label: "MRR" },
];

function retentionCellClass(offset: number, pct: number): string {
  if (offset === 0) return "bg-zinc-100 text-zinc-700";
  if (pct >= 95) return "bg-green-100 text-green-800";
  if (pct >= 85) return "bg-amber-100 text-amber-900";
  return "bg-red-100 text-red-900";
}

export function CohortTableMock() {
  const [metric, setMetric] = useState<CohortMetric>("retention");
  const selectedKeys = useMemo(() => new Set([metric]), [metric]);

  return (
    <div>
      <div className="flex justify-start mb-4">
        <FieldSelect
          label="Métrica"
          className="min-w-[200px] max-w-xs"
          items={METRIC_OPTIONS}
          selectedKeys={selectedKeys}
          onSelectionChange={(key) => {
            if (key === "retention" || key === "mrr") setMetric(key);
          }}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className={`${nucleusTableHeadCellClass} w-40`}>Cohort</th>
              {COHORT_OFFSETS.map((o) => (
                <th key={o} className={nucleusTableHeadCellCenterClass}>
                  M{o}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COHORT.map((row) => (
              <tr key={row.label}>
                <td className="p-1.5 align-top">
                  <div className="font-medium text-zinc-900">{row.label}</div>
                  <div className="text-[10px] text-zinc-500">{row.n} clientes</div>
                </td>
                {COHORT_OFFSETS.map((offset) => {
                  const data = metric === "retention" ? row.r : row.m;
                  const value = data[offset];
                  if (value === undefined) {
                    return (
                      <td key={offset} className="p-0">
                        <div className="rounded-md bg-zinc-50 text-center text-zinc-400 py-3 text-xs">
                          —
                        </div>
                      </td>
                    );
                  }
                  if (metric === "retention") {
                    return (
                      <td key={offset} className="p-0">
                        <div
                          className={`rounded-md text-center py-3 text-xs font-medium ${retentionCellClass(offset, value)}`}
                        >
                          {value.toFixed(0)}%
                        </div>
                      </td>
                    );
                  }
                  return (
                    <td key={offset} className="p-0">
                      <div className="rounded-md text-center py-3 text-xs font-medium bg-slate-100 text-slate-800">
                        {fmtMil(value)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
