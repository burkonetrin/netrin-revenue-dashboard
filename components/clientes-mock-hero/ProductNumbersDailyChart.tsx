"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  buildProductNumbersDailySeries,
  type ProductNumbersRow,
  type ProductNumbersSegmentTone,
} from "../../clientesDashboardMockData";
import { fmtN } from "../../clientesDashboardMockFormat";
import {
  ChartTooltipPortal,
  type ChartTooltipState,
} from "../ChartTooltipPortal";
import { TOOLTIP_TITLE_CLASS } from "@/shared/constants/tooltip.constants";
import { CmpRight } from "./CmpRight";

const TOTAL_SERIES_ID = "__total__";
const TOTAL_LINE_COLOR = "#652cdd";

const LINE_COLOR: Record<ProductNumbersSegmentTone, string> = {
  green: "#16a34a",
  red: "#dc2626",
  yellow: "#d97706",
  grey: "#71717a",
};

type ProductNumbersDailyChartProps = {
  row: ProductNumbersRow;
  year: number;
  month: number;
};

function daySegmentTotal(
  values: Record<string, number>,
  label: string,
): number {
  return values[label] ?? 0;
}

function dayAllSegmentsTotal(
  values: Record<string, number>,
  row: ProductNumbersRow,
): number {
  return row.segments.reduce(
    (sum, segment) => sum + daySegmentTotal(values, segment.label),
    0,
  );
}

function TooltipRow({
  label,
  color,
  cur,
  prev,
  showCmp,
}: {
  label: string;
  color: string;
  cur: number;
  prev: number;
  showCmp: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 my-1">
      <span className="flex items-center gap-2 text-zinc-600">
        <span
          className="size-2 rounded-full shrink-0"
          style={{ background: color }}
        />
        {label}
      </span>
      <span className="font-semibold flex items-baseline gap-1.5 tabular-nums">
        {fmtN(cur)}
        {showCmp ? <CmpRight cur={cur} prev={prev} /> : null}
      </span>
    </div>
  );
}

export function ProductNumbersDailyChart({
  row,
  year,
  month,
}: ProductNumbersDailyChartProps) {
  const points = useMemo(
    () => buildProductNumbersDailySeries(row, year, month),
    [row, year, month],
  );

  const [legendVis, setLegendVis] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = { [TOTAL_SERIES_ID]: true };
    row.segments.forEach((segment) => {
      initial[segment.label] = true;
    });
    return initial;
  });

  const [tooltip, setTooltip] = useState<ChartTooltipState | null>(null);

  const W = 960;
  const H = 220;
  const pl = 48;
  const pr = 16;
  const pt = 16;
  const pb = 40;
  const iw = W - pl - pr;
  const ih = H - pt - pb;
  const dayCount = points.length;

  const maxY = useMemo(() => {
    let max = 0;
    for (const point of points) {
      if (legendVis[TOTAL_SERIES_ID]) {
        max = Math.max(max, dayAllSegmentsTotal(point.values, row));
      }
      for (const segment of row.segments) {
        if (!legendVis[segment.label]) continue;
        max = Math.max(max, daySegmentTotal(point.values, segment.label));
      }
    }
    return max > 0 ? max * 1.08 : 1;
  }, [legendVis, points, row]);

  const toX = (dayIndex: number) =>
    pl + (dayIndex / Math.max(dayCount - 1, 1)) * iw;
  const toY = (value: number) => pt + ih - (value / maxY) * ih;

  const legendItems = useMemo(
    () => [
      {
        id: TOTAL_SERIES_ID,
        label: row.totalLabel,
        color: TOTAL_LINE_COLOR,
      },
      ...row.segments.map((segment) => ({
        id: segment.label,
        label: segment.label,
        color: LINE_COLOR[segment.tone],
      })),
    ],
    [row],
  );

  const showDayTip = useCallback(
    (clientX: number, clientY: number, dayIndex: number) => {
      const point = points[dayIndex];
      const prevPoint = dayIndex > 0 ? points[dayIndex - 1] : point;
      const title = `Dia ${point.day}`;

      const content: ReactNode = (
        <>
          <div className={`${TOOLTIP_TITLE_CLASS} mb-2`}>{title}</div>
          {legendVis[TOTAL_SERIES_ID] ? (
            <TooltipRow
              label={row.totalLabel}
              color={TOTAL_LINE_COLOR}
              cur={dayAllSegmentsTotal(point.values, row)}
              prev={dayAllSegmentsTotal(prevPoint.values, row)}
              showCmp
            />
          ) : null}
          {row.segments.map((segment) =>
            legendVis[segment.label] ? (
              <TooltipRow
                key={segment.label}
                label={segment.label}
                color={LINE_COLOR[segment.tone]}
                cur={daySegmentTotal(point.values, segment.label)}
                prev={daySegmentTotal(prevPoint.values, segment.label)}
                showCmp
              />
            ) : null,
          )}
        </>
      );

      setTooltip({ x: clientX, y: clientY, content });
    },
    [legendVis, points, row],
  );

  const seriesPaths = useMemo(() => {
    const paths: { id: string; d: string; color: string; width: number }[] = [];

    if (legendVis[TOTAL_SERIES_ID]) {
      const d = points
        .map((point, index) => {
          const v = dayAllSegmentsTotal(point.values, row);
          return `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(v)}`;
        })
        .join(" ");
      paths.push({ id: TOTAL_SERIES_ID, d, color: TOTAL_LINE_COLOR, width: 2.25 });
    }

    row.segments.forEach((segment) => {
      if (!legendVis[segment.label]) return;
      const d = points
        .map((point, index) => {
          const v = daySegmentTotal(point.values, segment.label);
          return `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(v)}`;
        })
        .join(" ");
      paths.push({
        id: segment.label,
        d,
        color: LINE_COLOR[segment.tone],
        width: 1.75,
      });
    });

    return paths;
  }, [legendVis, points, row, maxY, dayCount]);

  return (
    <div className="w-full overflow-x-auto rounded-sm bg-zinc-50/80 px-2 py-2">
      <div onMouseLeave={() => setTooltip(null)} className="w-full">
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Visão diária — ${row.productCode}`}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = pt + ih * (1 - t);
            return (
              <g key={t}>
                <line x1={pl} x2={W - pr} y1={y} y2={y} stroke="#f4f4f5" />
                <text
                  x={pl - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={9}
                  fill="#a1a1aa"
                >
                  {fmtN(Math.round(maxY * t))}
                </text>
              </g>
            );
          })}

          {seriesPaths.map((series) => (
            <path
              key={series.id}
              d={series.d}
              fill="none"
              stroke={series.color}
              strokeWidth={series.width}
            />
          ))}

          {points.map((point, index) => (
            <g key={point.day}>
              <rect
                x={toX(index) - iw / dayCount / 2}
                y={pt}
                width={iw / dayCount}
                height={ih}
                fill="transparent"
                className="cursor-crosshair"
                onMouseMove={(e) => showDayTip(e.clientX, e.clientY, index)}
              />
              <text
                x={toX(index)}
                y={H - 12}
                textAnchor="middle"
                fontSize={8}
                fill="#71717a"
              >
                {point.day}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mt-3 pt-3 border-t border-zinc-100">
        {legendItems.map((leg) => {
          const off = !legendVis[leg.id];
          return (
            <button
              key={leg.id}
              type="button"
              className={`inline-flex items-center gap-1.5 text-[11px] text-zinc-600 px-2.5 py-1 rounded-full bg-zinc-100 border-none font-inherit cursor-pointer ${
                off ? "opacity-35 line-through" : ""
              }`}
              onClick={() =>
                setLegendVis((v) => ({ ...v, [leg.id]: !v[leg.id] }))
              }
            >
              <span
                className="w-3.5 h-0 border-t-2"
                style={{ borderColor: leg.color }}
              />
              {leg.label}
            </button>
          );
        })}
      </div>

      <ChartTooltipPortal tooltip={tooltip} />
    </div>
  );
}
