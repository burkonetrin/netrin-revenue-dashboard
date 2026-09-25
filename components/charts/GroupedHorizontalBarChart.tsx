"use client";

import { formatCompact, formatCurrency } from "../../utils/format";

export interface GroupedBarRow {
  label: string;
  franchises: number;
  billing: number;
}

interface GroupedHorizontalBarChartProps {
  rows: GroupedBarRow[];
  franchiseLegend?: string;
  billingLegend?: string;
}

export function GroupedHorizontalBarChart({
  rows,
  franchiseLegend = "Qtd. franquias",
  billingLegend = "Faturamento (3m)",
}: GroupedHorizontalBarChartProps) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-zinc-500 py-8 text-center">
        Nenhum dado para os filtros selecionados.
      </p>
    );
  }

  const maxFr = Math.max(...rows.map((r) => r.franchises), 1);
  const maxBill = Math.max(...rows.map((r) => r.billing), 1);
  const rowHeight = 44;
  const chartHeight = rows.length * rowHeight + 24;

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-4 text-xs text-zinc-600 mb-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-primary-400" />
          {franchiseLegend}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-secondary-400" />
          {billingLegend}
        </span>
      </div>
      <svg
        width="100%"
        height={chartHeight}
        viewBox={`0 0 640 ${chartHeight}`}
        role="img"
        aria-label="Gráfico de barras agrupadas"
      >
        {rows.map((row, index) => {
          const y = index * rowHeight + 8;
          const frWidth = (row.franchises / maxFr) * 220;
          const billWidth = (row.billing / maxBill) * 220;
          return (
            <g key={row.label}>
              <text
                x={0}
                y={y + 22}
                className="fill-zinc-700 text-[11px]"
                fontSize={11}
              >
                {row.label.length > 18
                  ? `${row.label.slice(0, 16)}…`
                  : row.label}
              </text>
              <rect
                x={140}
                y={y + 4}
                width={frWidth}
                height={14}
                rx={3}
                className="fill-primary-400"
              />
              <text
                x={145 + frWidth + 4}
                y={y + 14}
                fontSize={10}
                className="fill-zinc-600"
              >
                {row.franchises}
              </text>
              <rect
                x={140}
                y={y + 22}
                width={billWidth}
                height={14}
                rx={3}
                className="fill-secondary-400"
              />
              <text
                x={145 + billWidth + 4}
                y={y + 32}
                fontSize={10}
                className="fill-zinc-600"
              >
                {formatCompact(row.billing)}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-[10px] text-zinc-400 mt-1">
        Valores de faturamento: média dos últimos 3 meses por franquia (
        {rows[0] ? formatCurrency(rows[0].billing) : "—"} escala relativa).
      </p>
    </div>
  );
}
