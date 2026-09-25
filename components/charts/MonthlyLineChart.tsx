"use client";

import { formatCompact } from "../../utils/format";

export interface MonthlyPoint {
  month: string;
  value: number;
  projected: boolean;
}

interface MonthlyLineChartProps {
  points: MonthlyPoint[];
}

export function MonthlyLineChart({ points }: MonthlyLineChartProps) {
  const width = 640;
  const height = 260;
  const pad = { top: 16, right: 16, bottom: 32, left: 48 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxY = Math.max(...points.map((p) => p.value)) * 1.05;
  const minY = Math.min(...points.map((p) => p.value)) * 0.95;

  const xStep = innerW / (points.length - 1);
  const toX = (i: number) => pad.left + i * xStep;
  const toY = (v: number) =>
    pad.top + innerH - ((v - minY) / (maxY - minY)) * innerH;

  const actual = points.filter((p) => !p.projected);
  const projected = points.filter((p) => p.projected);
  const bridgeIndex = actual.length - 1;

  const linePath = (subset: MonthlyPoint[], startIndex: number) =>
    subset
      .map((p, i) => {
        const idx = startIndex + i;
        return `${i === 0 ? "M" : "L"} ${toX(idx)} ${toY(p.value)}`;
      })
      .join(" ");

  const actualPath = linePath(actual, 0);
  const projectedPath =
    actual.length > 0 && projected.length > 0
      ? `M ${toX(bridgeIndex)} ${toY(actual[bridgeIndex].value)} ${projected
          .map((p, i) => `L ${toX(bridgeIndex + 1 + i)} ${toY(p.value)}`)
          .join(" ")}`
      : "";

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-4 text-xs text-zinc-600 mb-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-6 h-0.5 bg-primary block" />
          Realizado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-6 h-0.5 border-t-2 border-dashed border-primary block" />
          Projeção
        </span>
      </div>
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Faturamento mensal"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = pad.top + innerH * (1 - t);
          const val = minY + (maxY - minY) * t;
          return (
            <g key={t}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                className="stroke-zinc-200"
                strokeWidth={1}
              />
              <text
                x={pad.left - 6}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                className="fill-zinc-500"
              >
                {formatCompact(val)}
              </text>
            </g>
          );
        })}
        <path
          d={actualPath}
          fill="none"
          className="stroke-primary"
          strokeWidth={2}
        />
        {projectedPath ? (
          <path
            d={projectedPath}
            fill="none"
            className="stroke-primary"
            strokeWidth={2}
            strokeDasharray="6 4"
          />
        ) : null}
        {points.map((p, i) => (
          <g key={p.month}>
            <circle
              cx={toX(i)}
              cy={toY(p.value)}
              r={4}
              className={p.projected ? "fill-white stroke-primary" : "fill-primary"}
              strokeWidth={2}
            />
            <text
              x={toX(i)}
              y={height - 8}
              textAnchor="middle"
              fontSize={10}
              className="fill-zinc-600"
            >
              {p.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
