"use client";

import { Select, SelectItem } from "@heroui/react";
import { useMemo, useState } from "react";
import { COHORT, COHORT_OFFSETS } from "../../clientesDashboardMockData";
import { fmtMil } from "../../clientesDashboardMockFormat";

type CohortMetric = "retention" | "mrr";

function retentionCellClass(offset: number, pct: number): string {
  if (offset === 0) return "bg-zinc-100 text-zinc-700";
  if (pct >= 95) return "bg-green-100 text-green-800";
  if (pct >= 85) return "bg-amber-100 text-amber-900";
  return "bg-red-100 text-red-900";
}

export function CohortTableMock() {
  const [metric, setMetric] = useState<CohortMetric>("retention");
  const metricKeys = useMemo(() => new Set([metric]), [metric]);

  return (
    <div>
      <div className="flex justify-start mb-4">
        <Select
          label="Métrica"
          size="sm"
          className="min-w-[200px] max-w-xs"
          selectedKeys={metricKeys}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0]?.toString() as CohortMetric;
            if (key === "retention" || key === "mrr") setMetric(key);
          }}
        >
          <SelectItem key="retention">Logo retention</SelectItem>
          <SelectItem key="mrr">MRR</SelectItem>
        </Select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium text-zinc-500 p-1.5">
                Cohort
              </th>
              {COHORT_OFFSETS.map((o) => (
                <th
                  key={o}
                  className="text-center text-[11px] font-medium text-zinc-500 p-1.5"
                >
                  M{o}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COHORT.map((row) => (
              <tr key={row.label}>
                <td className="text-left p-2 align-top">
                  <strong>{row.label}</strong>
                  <br />
                  <span className="text-[11px] text-zinc-500">
                    {row.n} clientes
                  </span>
                </td>
                {COHORT_OFFSETS.map((o) => {
                  const map = metric === "retention" ? row.r : row.m;
                  const value = map[o];
                  if (value === undefined) {
                    return (
                      <td key={o}>
                        <div className="rounded-md text-center py-2.5 font-medium bg-zinc-50 text-zinc-400">
                          —
                        </div>
                      </td>
                    );
                  }
                  if (metric === "retention") {
                    return (
                      <td key={o}>
                        <div
                          className={`rounded-md text-center py-2.5 font-medium ${retentionCellClass(o, value)}`}
                        >
                          {value}%
                        </div>
                      </td>
                    );
                  }
                  return (
                    <td key={o}>
                      <div className="rounded-md text-center py-2.5 font-medium">
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
