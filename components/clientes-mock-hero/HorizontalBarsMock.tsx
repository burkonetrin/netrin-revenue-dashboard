"use client";

import { useState } from "react";
import type { BarRow, HealthBarRow } from "../../clientesDashboardMockData";
import { fc, fmt } from "../../clientesDashboardMockFormat";
import {
  ChartTooltipPortal,
  type ChartTooltipState,
} from "../ChartTooltipPortal";
import { CmpRight } from "./CmpRight";

interface HorizontalBarsMockProps {
  rows: BarRow[] | HealthBarRow[];
  color: string;
  money?: boolean;
  health?: boolean;
}

export function HorizontalBarsMock({
  rows,
  color,
  money = true,
  health = false,
}: HorizontalBarsMockProps) {
  const [tooltip, setTooltip] = useState<ChartTooltipState | null>(null);
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
                        <strong>{label}</strong>
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
