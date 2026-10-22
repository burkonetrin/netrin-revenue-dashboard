"use client";

import { PieChart } from "lucide-react";
import { SALES_REP_NUMBERS_ROWS } from "../../clientesDashboardMockData";
import { fmt } from "../../clientesDashboardMockFormat";
import { CmpRight } from "./CmpRight";

const DONUT_SIZE = 108;
const DONUT_STROKE = 9;
const DONUT_RADIUS = (DONUT_SIZE - DONUT_STROKE) / 2;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

const TOTAL_FATURAMENTO = SALES_REP_NUMBERS_ROWS.reduce(
  (sum, row) => sum + row.faturamento,
  0,
);

function faturamentoSharePct(faturamento: number): number {
  if (TOTAL_FATURAMENTO <= 0) return 0;
  return Math.round((faturamento / TOTAL_FATURAMENTO) * 100);
}

function goalProgress(current: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(current / goal, 1);
}

function GoalDonutChart({
  label,
  current,
  goal,
  ringColor,
}: {
  label: string;
  current: number;
  goal: number;
  ringColor: string;
}) {
  const progress = goalProgress(current, goal);
  const dash = progress * DONUT_CIRCUMFERENCE;
  const center = DONUT_SIZE / 2;

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <span className="mb-1.5 text-[9px] font-medium text-zinc-500">{label}</span>
      <div
        className="relative shrink-0"
        style={{ width: DONUT_SIZE, height: DONUT_SIZE }}
      >
        <svg
          width={DONUT_SIZE}
          height={DONUT_SIZE}
          viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
          aria-hidden
        >
          <circle
            cx={center}
            cy={center}
            r={DONUT_RADIUS}
            fill="none"
            stroke="#e4e4e7"
            strokeWidth={DONUT_STROKE}
          />
          <circle
            cx={center}
            cy={center}
            r={DONUT_RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth={DONUT_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${DONUT_CIRCUMFERENCE}`}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-1 text-center leading-tight"
        >
          <span className="text-[9px] font-semibold tabular-nums text-zinc-900">
            {fmt(current)}
          </span>
          <span className="mt-0.5 text-[8px] font-medium tabular-nums text-zinc-500">
            de {fmt(goal)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SalesRepGoalCard({
  repLabel,
  faturamento,
  faturamentoGrowthPct,
  receitaGeral,
  receitaGeralMeta,
  mrr,
  mrrMeta,
}: {
  repLabel: string;
  faturamento: number;
  faturamentoGrowthPct: number;
  receitaGeral: number;
  receitaGeralMeta: number;
  mrr: number;
  mrrMeta: number;
}) {
  const prev = 100;
  const cur = prev * (1 + faturamentoGrowthPct / 100);
  const sharePct = faturamentoSharePct(faturamento);

  return (
    <article
      className="relative flex flex-col rounded-sm border border-zinc-100 bg-zinc-50/80 p-3 pb-8"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h4 className="m-0 text-sm font-semibold text-zinc-900">{repLabel}</h4>
        <CmpRight
          cur={cur}
          prev={prev}
          className="text-[10px] font-normal shrink-0"
        />
      </div>

      <div className="flex gap-2">
        <GoalDonutChart
          label="Receita Geral"
          current={receitaGeral}
          goal={receitaGeralMeta}
          ringColor="#652cdd"
        />
        <GoalDonutChart
          label="MRR"
          current={mrr}
          goal={mrrMeta}
          ringColor="#8456e4"
        />
      </div>

      <div
        className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums text-zinc-500"
      >
        <PieChart className="size-3 shrink-0" strokeWidth={2} aria-hidden />
        {sharePct}%
      </div>
    </article>
  );
}

export function ProfitCenterNumbersMock() {
  const rows = [...SALES_REP_NUMBERS_ROWS].sort(
    (a, b) => b.faturamento - a.faturamento,
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {rows.map((row) => (
        <SalesRepGoalCard
          key={row.repId}
          repLabel={row.repLabel}
          faturamento={row.faturamento}
          faturamentoGrowthPct={row.faturamentoGrowthPct}
          receitaGeral={row.receitaGeral}
          receitaGeralMeta={row.receitaGeralMeta}
          mrr={row.mrr}
          mrrMeta={row.mrrMeta}
        />
      ))}
    </div>
  );
}
