"use client";

import { useState } from "react";
import type { BarChartPoint } from "../../types";
import {
  ChartTooltipPortal,
  type ChartTooltipState,
} from "../ChartTooltipPortal";
import { KpiComparisonBadge } from "../KpiComparisonBadge";
import { formatCompact, formatCurrency } from "../../utils/format";

interface VerticalBarChartProps {
  points: BarChartPoint[];
  valueFormatter?: (v: number) => string;
  ariaLabel: string;
}

export function VerticalBarChart({
  points,
  valueFormatter = (v) => formatCurrency(v),
  ariaLabel,
}: VerticalBarChartProps) {
  const [tooltip, setTooltip] = useState<ChartTooltipState | null>(null);

  if (points.length === 0) {
    return (
      <p className="text-sm text-zinc-500 py-8 text-center">
        Nenhum dado para os filtros selecionados.
      </p>
    );
  }

  const max = Math.max(...points.map((p) => p.value), 1);
  const width = 640;
  const height = 240;
  const pad = { left: 16, right: 16, bottom: 64, top: 16 };
  const barArea = width - pad.left - pad.right;
  const slot = barArea / points.length;
  const barWidth = slot * 0.55;

  return (
    <div className="overflow-visible">
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        className="overflow-visible"
      >
        {points.map((point, i) => {
          const barH = (point.value / max) * (height - pad.bottom - pad.top - 12);
          const x = pad.left + i * slot + (slot - barWidth) / 2;
          const y = height - pad.bottom - barH;
          return (
            <g key={point.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={4}
                className="fill-primary-400"
                onMouseEnter={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    content: (
                      <div className="space-y-1">
                        <p className="font-semibold">{point.label}</p>
                        <div className="flex items-center gap-2">
                          <KpiComparisonBadge
                            current={point.value}
                            previous={point.previous}
                            isCurrency
                          />
                          <span>{valueFormatter(point.value)}</span>
                        </div>
                      </div>
                    ),
                  })
                }
                onMouseMove={(e) =>
                  setTooltip((t) =>
                    t ? { ...t, x: e.clientX, y: e.clientY } : t,
                  )
                }
                onMouseLeave={() => setTooltip(null)}
              />
              <text
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize={10}
                className="fill-zinc-700"
              >
                {formatCompact(point.value)}
              </text>
              <foreignObject
                x={x - 6}
                y={height - pad.bottom + 6}
                width={barWidth + 12}
                height={48}
              >
                <p className="text-[10px] text-zinc-600 text-center leading-tight">
                  {point.label}
                </p>
              </foreignObject>
            </g>
          );
        })}
      </svg>
      <ChartTooltipPortal tooltip={tooltip} />
    </div>
  );
}
