"use client";

import { KpiComparisonBadge } from "./KpiComparisonBadge";
import { CLIENTS_PAGE_KPIS } from "../cohortMockData";
import { formatCurrency, formatPercent } from "../utils/format";

function KpiCard({
  label,
  kpiKey,
  subtitle,
}: {
  label: string;
  kpiKey: keyof typeof CLIENTS_PAGE_KPIS;
  subtitle?: string;
}) {
  const kpi = CLIENTS_PAGE_KPIS[kpiKey];
  const main = kpi.isPercent
    ? formatPercent(kpi.current)
    : formatCurrency(kpi.current);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <KpiComparisonBadge
          current={kpi.current}
          previous={kpi.previous}
          isPercent={kpi.isPercent}
          isCurrency={!kpi.isPercent}
        />
        <p className="text-2xl font-semibold text-zinc-900">{main}</p>
      </div>
      {subtitle ? (
        <p className="text-[11px] text-zinc-400 mt-1">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function ClientsOverviewKpis() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KpiCard label="Total faturado" kpiKey="totalFaturado" />
      <KpiCard label="ACV" kpiKey="acv" />
      <KpiCard label="Spot" kpiKey="spot" />
      <KpiCard
        label="Total últimos 12 meses"
        kpiKey="total12m"
        subtitle="Competência selecionada"
      />
      <KpiCard label="Excedente" kpiKey="excedente" />
      <KpiCard label="Descontos" kpiKey="descontos" />
      <KpiCard label="Acréscimos" kpiKey="acrescimos" />
      <KpiCard label="MRR" kpiKey="mrr" />
    </div>
  );
}

export function ConsumoMedioKpiInline() {
  const kpi = CLIENTS_PAGE_KPIS.consumoMedio;
  return (
    <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 mb-3">
      <p className="text-xs text-zinc-500">Consumo médio</p>
      <div className="flex flex-wrap items-baseline gap-2">
        <KpiComparisonBadge
          current={kpi.current}
          previous={kpi.previous}
          isPercent
        />
        <span className="text-lg font-semibold text-zinc-900">
          {formatPercent(kpi.current)}
        </span>
        <span className="text-xs text-zinc-500">Média últimos 3 meses</span>
      </div>
    </div>
  );
}
