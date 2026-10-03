"use client";

import { useMemo, useState } from "react";
import type { MonthlyEvolutionPoint } from "../../cohortMockData";
import {
  ChartTooltipPortal,
  type ChartTooltipState,
} from "../ChartTooltipPortal";
import { TOOLTIP_MUTED_CLASS, TOOLTIP_TITLE_CLASS } from "@/shared/constants/tooltip.constants";
import { KpiComparisonBadge } from "../KpiComparisonBadge";
import { formatCompact, formatCurrency } from "../../utils/format";

interface EvolutionComboChartProps {
  points: MonthlyEvolutionPoint[];
}

const LINE_SERIES: {
  key: keyof MonthlyEvolutionPoint;
  label: string;
  color: string;
}[] = [
  { key: "totalFaturado", label: "Total faturado", color: "#652cdd" },
  { key: "acv", label: "ACV", color: "#2563eb" },
  { key: "spot", label: "Spot", color: "#0891b2" },
  { key: "excedente", label: "Excedente", color: "#ea580c" },
  { key: "acrescimo", label: "Acréscimo", color: "#16a34a" },
  { key: "desconto", label: "Desconto", color: "#dc2626" },
  { key: "mrr", label: "MRR", color: "#7c3aed" },
];

const STACK_KEYS: {
  key: keyof MonthlyEvolutionPoint;
  label: string;
  color: string;
}[] = [
  { key: "franquiasAtivas", label: "Franquias ativas", color: "#c4b5fd" },
  { key: "contratosAtivos", label: "Contratos ativos", color: "#8456e4" },
  { key: "clientesAtivos", label: "Clientes ativos", color: "#652cdd" },
];

function TooltipMetric({
  label,
  current,
  previous,
}: {
  label: string;
  current: number;
  previous: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <span className="text-zinc-600">{label}</span>
      <div className="flex items-center gap-2">
        <KpiComparisonBadge
          current={current}
          previous={previous}
          isCurrency
        />
        <span className="font-medium text-zinc-900">
          {formatCurrency(current)}
        </span>
      </div>
    </div>
  );
}

export function EvolutionComboChart({ points }: EvolutionComboChartProps) {
  const [tooltip, setTooltip] = useState<ChartTooltipState | null>(null);

  const width = 920;
  const height = 320;
  const pad = { top: 24, right: 20, bottom: 40, left: 52 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const maxLine = useMemo(
    () => Math.max(...points.flatMap((p) => LINE_SERIES.map((s) => p[s.key] as number))),
    [points],
  );
  const maxStack = useMemo(
    () =>
      Math.max(
        ...points.map(
          (p) =>
            p.franquiasAtivas + p.contratosAtivos + p.clientesAtivos,
        ),
      ),
    [points],
  );

  const slot = innerW / points.length;
  const barW = slot * 0.45;

  const toX = (i: number) => pad.left + i * slot + slot / 2;
  const lineY = (v: number) =>
    pad.top + innerH - (v / (maxLine * 1.08)) * innerH;
  const stackScale = (innerH * 0.35) / maxStack;

  return (
    <div className="w-full overflow-visible">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-600 mb-3">
        {LINE_SERIES.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span
              className="w-5 h-0.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 ml-2 border-l pl-2 border-zinc-200">
          {STACK_KEYS.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1">
              <span
                className="size-2.5 rounded-sm"
                style={{ backgroundColor: s.color }}
              />
              {s.label}
            </span>
          ))}
        </span>
      </div>
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Evolução mensal"
        className="overflow-visible"
      >
        {[0, 0.5, 1].map((t) => {
          const y = pad.top + innerH * (1 - t);
          const val = maxLine * 1.08 * t;
          return (
            <g key={t}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                stroke="#e4e4e7"
                strokeWidth={1}
              />
              <text
                x={pad.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                fill="#71717a"
              >
                {formatCompact(val)}
              </text>
            </g>
          );
        })}

        {points.map((p, i) => {
          const cx = toX(i);
          const stackTotal =
            p.franquiasAtivas + p.contratosAtivos + p.clientesAtivos;
          let yStack = pad.top + innerH;
          const segments = STACK_KEYS.map((sk) => {
            const h = (p[sk.key] as number) * stackScale;
            yStack -= h;
            return { ...sk, h, y: yStack, value: p[sk.key] as number };
          });
          return (
            <g key={p.month}>
              {segments.map((seg) => (
                <rect
                  key={seg.key}
                  x={cx - barW / 2}
                  y={seg.y}
                  width={barW}
                  height={seg.h}
                  fill={seg.color}
                  rx={2}
                />
              ))}
              <rect
                x={cx - slot / 2 + 4}
                y={pad.top}
                width={slot - 8}
                height={innerH}
                fill="transparent"
                onMouseEnter={(e) => {
                  const prev = i > 0 ? points[i - 1] : null;
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    content: (
                      <div className="space-y-1 min-w-[220px]">
                        <p className={`${TOOLTIP_TITLE_CLASS} mb-1`}>
                          {p.month}
                          {prev ? " vs mês anterior" : ""}
                        </p>
                        {LINE_SERIES.map((s) => (
                          <TooltipMetric
                            key={s.key}
                            label={s.label}
                            current={p[s.key] as number}
                            previous={
                              prev ? (prev[s.key] as number) : (p[s.key] as number)
                            }
                          />
                        ))}
                        <p className={`border-t border-zinc-100 pt-1 mt-1 ${TOOLTIP_MUTED_CLASS}`}>
                          Empilhado: {stackTotal.toLocaleString("pt-BR")} un.
                        </p>
                      </div>
                    ),
                  });
                }}
                onMouseMove={(e) =>
                  setTooltip((t) =>
                    t ? { ...t, x: e.clientX, y: e.clientY } : t,
                  )
                }
                onMouseLeave={() => setTooltip(null)}
              />
              <text
                x={cx}
                y={height - 10}
                textAnchor="middle"
                fontSize={10}
                fill="#52525b"
              >
                {p.month}
              </text>
            </g>
          );
        })}

        {LINE_SERIES.map((series) => {
          const d = points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${lineY(p[series.key] as number)}`)
            .join(" ");
          return (
            <path
              key={series.key}
              d={d}
              fill="none"
              stroke={series.color}
              strokeWidth={2}
              pointerEvents="none"
            />
          );
        })}
        {points.map((p, i) =>
          LINE_SERIES.map((series) => (
            <circle
              key={`${p.month}-${series.key}`}
              cx={toX(i)}
              cy={lineY(p[series.key] as number)}
              r={3}
              fill={series.color}
              pointerEvents="none"
            />
          )),
        )}
      </svg>
      <ChartTooltipPortal tooltip={tooltip} />
    </div>
  );
}
