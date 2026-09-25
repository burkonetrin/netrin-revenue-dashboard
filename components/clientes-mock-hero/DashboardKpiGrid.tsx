"use client";

import { TrendingUp, Wallet } from "lucide-react";
import { KPIS } from "../../clientesDashboardMockData";
import { fmt } from "../../clientesDashboardMockFormat";
import { CmpRight } from "./CmpRight";

const NO_CMP = new Set(["Total últimos 12 meses", "Média últimos 3 meses"]);

function KpiIcon({ ico }: { ico: "trend" | "wallet" }) {
  const Icon = ico === "wallet" ? Wallet : TrendingUp;
  return (
    <span
      className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-primary-50 text-primary"
      aria-hidden
    >
      <Icon className="size-[18px]" />
    </span>
  );
}

export function DashboardKpiGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {KPIS.map((k) => (
        <div
          key={k.l}
          className="relative min-h-[108px] rounded-xl border border-zinc-200 bg-white p-[18px] shadow-sm"
        >
          <span className="block text-[13px] text-zinc-500 pr-12">{k.l}</span>
          <KpiIcon ico={k.ico} />
          <div className="mt-3 flex flex-wrap items-baseline gap-2.5">
            <span className="text-[26px] font-semibold">{fmt(k.c)}</span>
            {!NO_CMP.has(k.l) ? <CmpRight cur={k.c} prev={k.p} /> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
