"use client";

import { useState } from "react";
import type { BarRow, HealthBarRow } from "../../clientesDashboardMockData";
import { fc, fmt } from "../../clientesDashboardMockFormat";
import {
  ChartTooltipPortal,
  type ChartTooltipState,
} from "../ChartTooltipPortal";
import { TOOLTIP_TITLE_CLASS } from "@/shared/constants/tooltip.constants";
import { CmpRight } from "./CmpRight";

interface HorizontalBarsMockProps {
  rows: BarRow[] | HealthBarRow[];
  color: string;
  money?: boolean;
  health?: boolean;
  /** Valor compacto + Share + variação mensal (produto / centro de lucro). */
  showRevenueBreakdown?: boolean;
}

function MetricsDivider() {
  return <span className="h-3 w-px shrink-0 bg-default-200" aria-hidden />;
}

function RevenueBarRows({
  rows,
  color,
  tooltip,
  setTooltip,
}: {
  rows: BarRow[];
  color: string;
  tooltip: ChartTooltipState | null;
  setTooltip: (value: ChartTooltipState | null) => void;
}) {
  const max = Math.max(...rows.map((r) => r.v), 1);
  const total = rows.reduce((sum, row) => sum + row.v, 0);

  return (
    <div className="flex flex-col gap-2 py-1" onMouseLeave={() => setTooltip(null)}>
      {rows.map((row) => {
        const share = total > 0 ? Math.round((row.v / total) * 100) : 0;
        const widthPct = (row.v / max) * 100;

        return (
          <div key={row.l} className="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] items-center gap-2">
            <span className="truncate text-[10px] text-zinc-600">{row.l}</span>
            <div className="min-w-0">
              <div
                className="h-4 cursor-default rounded-[3px]"
                style={{ width: `${widthPct}%`, minWidth: row.v > 0 ? 4 : 0, backgroundColor: color }}
                onMouseMove={(e) => {
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    content: (
                      <>
                        <span className={TOOLTIP_TITLE_CLASS}>{row.l}</span>
                        <div className="mt-1.5 flex items-baseline gap-1.5 font-semibold">
                          {fmt(row.v)}
                          <CmpRight cur={row.v} prev={row.p} />
                        </div>
                      </>
                    ),
                  });
                }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 text-[10px] text-zinc-500">
              <span className="whitespace-nowrap tabular-nums">{fc(row.v)}</span>
              <MetricsDivider />
              <span className="whitespace-nowrap tabular-nums">{share}%</span>
              <MetricsDivider />
              <CmpRight
                cur={row.v}
                prev={row.p}
                className="text-[10px] font-normal"
              />
            </div>
          </div>
        );
      })}
      <ChartTooltipPortal tooltip={tooltip} />
    </div>
  );
}

export function HorizontalBarsMock({
  rows,
  color,
  money = true,
  health = false,
  showRevenueBreakdown = false,
}: HorizontalBarsMockProps) {
  const [tooltip, setTooltip] = useState<ChartTooltipState | null>(null);

  if (showRevenueBreakdown && money && !health) {
    return (
      <RevenueBarRows
        rows={rows as BarRow[]}
        color={color}
        tooltip={tooltip}
        setTooltip={setTooltip}
      />
    );
  }

  const max = Math.max(...rows.map((r) => r.v), 1);
  const rowH = health ? 44 : 36;
  const labelW = health ? 100 : 120;
  const chartW = 180;
  const H = rows.length * rowH + 16;
  const W = labelW + chartW + 70;

  return (
    <div onMouseLeave={() => setTooltip(null)}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {rows.map((r, i) => {
          const y = i * rowH + 6;
          const w = (r.v / max) * chartW;
          const label = health ? (r as HealthBarRow).title : (r as BarRow).l;
          return (
            <g key={label}>
              {health ? (
                <>
                  <text x={0} y={y + 10} fontSize={10} fill="#52525b">
                    {(r as HealthBarRow).title}
                  </text>
                  <text x={0} y={y + 22} fontSize={9} fill="#a1a1aa">
                    {(r as HealthBarRow).sub}
                  </text>
                </>
              ) : (
                <text x={0} y={y + 14} fontSize={10} fill="#52525b">
                  {(r as BarRow).l}
                </text>
              )}
              <rect
                x={labelW}
                y={y + 2}
                width={w}
                height={16}
                rx={3}
                fill={color}
                className="cursor-default"
                onMouseMove={(e) => {
                  const val = money ? fmt(r.v) : String(r.v);
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    content: (
                      <>
                        <span className={TOOLTIP_TITLE_CLASS}>{label}</span>
                        <div className="mt-1.5 font-semibold flex items-baseline gap-1.5">
                          {val}
                          <CmpRight cur={r.v} prev={r.p} />
                        </div>
                      </>
                    ),
                  });
                }}
              />
              <text
                x={labelW + w + 6}
                y={y + 14}
                fontSize={10}
                fill="#71717a"
              >
                {money ? fc(r.v) : r.v}
              </text>
            </g>
          );
        })}
      </svg>
      <ChartTooltipPortal tooltip={tooltip} />
    </div>
  );
}
