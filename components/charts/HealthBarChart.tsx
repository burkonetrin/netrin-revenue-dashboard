"use client";

import { useState } from "react";
import type { ClientHealth } from "../../types";
import { HEALTH_CHART_LABELS } from "../../constants";
import {
  ChartTooltipPortal,
  type ChartTooltipState,
} from "../ChartTooltipPortal";
import { TOOLTIP_TITLE_CLASS } from "@/shared/constants/tooltip.constants";
import { KpiComparisonBadge } from "../KpiComparisonBadge";
import { prototypePreviousValue } from "../../utils/comparison";

interface HealthBarChartProps {
  counts: Record<ClientHealth, number>;
}

const ORDER: ClientHealth[] = [
  "risco_alto",
  "risco_medio",
  "sucesso",
  "oportunidade",
];

const BAR_COLORS: Record<ClientHealth, string> = {
  risco_alto: "#ef4444",
  risco_medio: "#f59e0b",
  sucesso: "#22c55e",
  oportunidade: "#652cdd",
};

export function HealthBarChart({ counts }: HealthBarChartProps) {
  const [tooltip, setTooltip] = useState<ChartTooltipState | null>(null);
  const max = Math.max(...ORDER.map((k) => counts[k]), 1);
  const width = 640;
  const height = 220;
  const pad = { left: 16, right: 16, bottom: 72, top: 16 };
  const barArea = width - pad.left - pad.right;
  const slot = barArea / ORDER.length;
  const barWidth = slot * 0.55;

  return (
    <div className="overflow-visible">
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Saúde dos clientes"
        className="overflow-visible"
      >
        {ORDER.map((key, i) => {
          const count = counts[key];
          const previous = prototypePreviousValue(count, i, 0.92);
          const barH = (count / max) * (height - pad.bottom - pad.top - 20);
          const x = pad.left + i * slot + (slot - barWidth) / 2;
          const y = height - pad.bottom - barH;
          return (
            <g key={key}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={4}
                fill={BAR_COLORS[key]}
                onMouseEnter={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    content: (
                      <div className="space-y-1">
                        <p className={TOOLTIP_TITLE_CLASS}>{HEALTH_CHART_LABELS[key]}</p>
                        <div className="flex items-center gap-2">
                          <KpiComparisonBadge
                            current={count}
                            previous={previous}
                          />
                          <span>{count} clientes</span>
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
                y={y - 6}
                textAnchor="middle"
                fontSize={12}
                className="fill-zinc-800 font-medium"
              >
                {count}
              </text>
              <foreignObject
                x={x - 8}
                y={height - pad.bottom + 8}
                width={barWidth + 16}
                height={56}
              >
                <p className="text-[10px] text-zinc-600 text-center leading-tight">
                  {HEALTH_CHART_LABELS[key]}
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
