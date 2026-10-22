"use client";

import { KPIS } from "../../clientesDashboardMockData";
import { fmtDetail } from "../../clientesDashboardMockFormat";
import { CmpRight } from "./CmpRight";

const NO_CMP = new Set(["Total últimos 12 meses", "Média últimos 3 meses"]);

export function DashboardKpiGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {KPIS.map((k) => (
        <div
          key={k.l}
          className="relative min-h-[108px] rounded-xl border border-[var(--ds-border)] bg-[var(--ds-card)] p-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <span className="block text-[13px] text-[var(--ds-muted)] pr-12">
            {k.l}
          </span>
          {!NO_CMP.has(k.l) ? (
            <div className="absolute top-4 right-4">
              <CmpRight cur={k.c} prev={k.p} />
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {k.meta != null ? (
              <>
                <span className="text-[26px] font-semibold tabular-nums">
                  {fmtDetail(k.c)}
                </span>
                <span className="text-sm font-normal text-zinc-500 tabular-nums">
                  de {fmtDetail(k.meta)}
                </span>
              </>
            ) : (
              <span className="text-[26px] font-semibold tabular-nums">
                {fmtDetail(k.c)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
