"use client";

import { KPIS } from "../../clientesDashboardMockData";
import { fmtDetail } from "../../clientesDashboardMockFormat";
import { CmpRight } from "./CmpRight";

const NO_CMP = new Set(["Total últimos 12 meses", "Média últimos 3 meses"]);
const KPI_LABEL_NOWRAP = new Set(["Total últimos 12 meses", "Média últimos 3 meses"]);

export function DashboardKpiGrid({ className = "mb-6" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 ${className}`}>
      {KPIS.map((k) => (
        <div
          key={k.l}
          className="relative min-h-[108px] rounded-xl border border-[var(--ds-border)] bg-[var(--ds-card)] p-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <span
            className={`block text-[13px] text-[var(--ds-muted)] pr-12 ${
              KPI_LABEL_NOWRAP.has(k.l) ? "whitespace-nowrap text-[12px]" : ""
            }`}
          >
            {k.l}
          </span>
          {!NO_CMP.has(k.l) ? (
            <div className="absolute top-4 right-4">
              <CmpRight cur={k.c} prev={k.p} />
            </div>
          ) : null}
          <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 pr-10">
            {k.meta != null ? (
              <>
                <span className="text-[19px] font-semibold leading-tight tabular-nums">
                  {fmtDetail(k.c)}
                </span>
                <span className="text-[11px] font-normal text-zinc-500 tabular-nums">
                  de {fmtDetail(k.meta)}
                </span>
              </>
            ) : (
              <span className="text-[19px] font-semibold leading-tight tabular-nums">
                {fmtDetail(k.c)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
