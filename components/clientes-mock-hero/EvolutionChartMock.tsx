"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  EVO,
  EVO_LABELS,
  LAST_REAL,
  LEGEND,
  initialLegendVisibility,
  isEvoReal,
  type EvoPointReal,
} from "../../clientesDashboardMockData";
import { fc, formatMetricVal } from "../../clientesDashboardMockFormat";
import {
  ChartTooltipPortal,
  type ChartTooltipState,
} from "../ChartTooltipPortal";
import { TOOLTIP_TITLE_CLASS } from "@/shared/constants/tooltip.constants";
import { CmpRight } from "./CmpRight";

const REVENUE_STACK_KEYS = ["acv", "spot", "exc", "mrr"] as const;
const COUNT_LINE_KEYS = ["cl", "ct", "fr"] as const;

/** Pesos visuais distintos por fatia (normalizados entre as séries visíveis). */
const REVENUE_STACK_VISUAL_WEIGHTS: Record<
  (typeof REVENUE_STACK_KEYS)[number],
  number
> = {
  acv: 0.4,
  spot: 0.18,
  exc: 0.1,
  mrr: 0.32,
};

function legendColor(id: string) {
  return LEGEND.find((item) => item.id === id)?.c ?? "#652cdd";
}

function TooltipRow({
  label,
  color,
  cur,
  prev,
  keyId,
  showCmp,
}: {
  label: string;
  color: string;
  cur: number;
  prev: number;
  keyId: string;
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
      <span className="font-semibold flex items-baseline gap-1.5">
        {formatMetricVal(keyId, cur)}
        {showCmp ? <CmpRight cur={cur} prev={prev} /> : null}
      </span>
    </div>
  );
}

export function EvolutionChartMock() {
  const [legendVis, setLegendVis] = useState(() => initialLegendVisibility());
  const [tooltip, setTooltip] = useState<ChartTooltipState | null>(null);

  const W = 960;
  const H = 320;
  const pl = 48;
  const pr = 48;
  const pt = 20;
  const pb = 52;
  const iw = W - pl - pr;
  const ih = H - pt - pb;
  const n = EVO.length;

  const { maxR, maxCnt } = useMemo(() => {
    const slice = EVO.slice(0, LAST_REAL + 1);
    const maxRVal =
      Math.max(
        ...slice.flatMap((p) => {
          if (!isEvoReal(p)) return [];
          return [
            Math.max(0, p.total - p.desc),
            p.desc,
            p.projTotal,
          ].filter((x): x is number => x !== undefined);
        }),
        ...EVO.slice(LAST_REAL + 1).flatMap((p) =>
          !isEvoReal(p) ? [p.projTotal] : [],
        ),
      ) * 1.05;
    const maxCntVal =
      Math.max(
        ...slice.flatMap((p) => (isEvoReal(p) ? [p.cl, p.ct, p.fr] : [])),
      ) * 1.1;
    return { maxR: maxRVal, maxCnt: maxCntVal };
  }, []);

  const tx = (i: number) => pl + (i / (n - 1)) * iw;
  const tyR = (v: number) => pt + ih - (v / maxR) * ih;
  const tyCnt = (v: number) => pt + ih - (v / maxCnt) * ih * 0.35;
  const bw = Math.max(10, (iw / n) * 0.42);

  const renderRevenueStack = (i: number, point: EvoPointReal) => {
    const cx = tx(i);
    const x = cx - bw / 2;
    const netTotal = Math.max(0, point.total - point.desc);
    const componentKeys = REVENUE_STACK_KEYS.filter((key) => legendVis[key]);
    const segments: { key: string; value: number; color: string }[] = [];

    if (componentKeys.length > 0) {
      const partSum = componentKeys.reduce((sum, key) => sum + point[key], 0);
      const visualWeightSum = componentKeys.reduce(
        (sum, key) => sum + REVENUE_STACK_VISUAL_WEIGHTS[key],
        0,
      );
      const blendShares = componentKeys.map((key) => {
        const dataShare = partSum > 0 ? point[key] / partSum : 0;
        const visualShare =
          visualWeightSum > 0
            ? REVENUE_STACK_VISUAL_WEIGHTS[key] / visualWeightSum
            : 0;
        return 0.5 * visualShare + 0.5 * dataShare;
      });
      const blendTotal = blendShares.reduce((sum, share) => sum + share, 0);
      componentKeys.forEach((key, index) => {
        const share =
          blendTotal > 0 ? blendShares[index] / blendTotal : 0;
        segments.push({
          key,
          value: netTotal * share,
          color: legendColor(key),
        });
      });
    } else if (legendVis.total) {
      segments.push({ key: "total", value: netTotal, color: legendColor("total") });
    }

    let y = pt + ih;
    return segments.map((segment) => {
      const height = (segment.value / maxR) * ih;
      y -= height;
      return (
        <rect
          key={`${i}-${segment.key}`}
          x={x}
          y={y}
          width={bw}
          height={Math.max(0, height)}
          fill={segment.color}
          opacity={0.97}
          rx={2}
        />
      );
    });
  };

  const showEvoTip = useCallback(
    (clientX: number, clientY: number, i: number) => {
      const p = EVO[i];
      const prev = i > 0 ? EVO[i - 1] : p;
      const title = EVO_LABELS[i];
      let content: ReactNode;

      if (i <= LAST_REAL && isEvoReal(p) && isEvoReal(prev)) {
        content = (
          <>
            <div className={`${TOOLTIP_TITLE_CLASS} mb-2`}>{title}</div>
            {legendVis.total ? (
              <TooltipRow
                label="Total faturado"
                color="#652cdd"
                cur={p.total}
                prev={prev.total}
                keyId="total"
                showCmp
              />
            ) : null}
            {legendVis.acv ? (
              <TooltipRow
                label="ACV"
                color="#2563eb"
                cur={p.acv}
                prev={prev.acv}
                keyId="acv"
                showCmp
              />
            ) : null}
            {legendVis.spot ? (
              <TooltipRow
                label="Spot"
                color="#0891b2"
                cur={p.spot}
                prev={prev.spot}
                keyId="spot"
                showCmp
              />
            ) : null}
            {legendVis.exc ? (
              <TooltipRow
                label="Excedente"
                color="#ea580c"
                cur={p.exc}
                prev={prev.exc}
                keyId="exc"
                showCmp
              />
            ) : null}
            {legendVis.mrr ? (
              <TooltipRow
                label="MRR"
                color="#7c3aed"
                cur={p.mrr}
                prev={prev.mrr}
                keyId="mrr"
                showCmp
              />
            ) : null}
            {legendVis.desc ? (
              <TooltipRow
                label="Descontos"
                color="#dc2626"
                cur={p.desc}
                prev={prev.desc}
                keyId="desc"
                showCmp
              />
            ) : null}
            <hr className="my-2 border-0 border-t border-[var(--ds-border)]" />
            {legendVis.cl ? (
              <TooltipRow
                label="Clientes ativos"
                color="#652cdd"
                cur={p.cl}
                prev={prev.cl}
                keyId="cl"
                showCmp
              />
            ) : null}
            {legendVis.ct ? (
              <TooltipRow
                label="Contratos ativos"
                color="#8456e4"
                cur={p.ct}
                prev={prev.ct}
                keyId="ct"
                showCmp
              />
            ) : null}
            {legendVis.fr ? (
              <TooltipRow
                label="Franquias ativas"
                color="#22c55e"
                cur={p.fr}
                prev={prev.fr}
                keyId="fr"
                showCmp
              />
            ) : null}
          </>
        );
      } else if (legendVis.proj && !isEvoReal(p) && isEvoReal(prev)) {
        content = (
          <>
            <div className={`${TOOLTIP_TITLE_CLASS} mb-2`}>{title}</div>
            <TooltipRow
              label="Projeção"
              color="#ef4444"
              cur={p.projTotal}
              prev={prev.total}
              keyId="proj"
              showCmp={false}
            />
          </>
        );
      } else {
        return;
      }

      setTooltip({ x: clientX, y: clientY, content });
    },
    [legendVis],
  );

  const countLinePaths = COUNT_LINE_KEYS.map((key) => {
    if (!legendVis[key]) return null;
    let d = "";
    for (let i = 0; i <= LAST_REAL; i++) {
      const point = EVO[i] as EvoPointReal;
      const v = point[key];
      d += `${i ? "L" : "M"} ${tx(i)} ${tyCnt(v)} `;
    }
    return (
      <path
        key={key}
        d={d}
        fill="none"
        stroke={legendColor(key)}
        strokeWidth={2}
        data-series={key}
      />
    );
  });

  let descPath = "";
  if (legendVis.desc) {
    for (let i = 0; i <= LAST_REAL; i++) {
      const point = EVO[i] as EvoPointReal;
      descPath += `${i ? "L" : "M"} ${tx(i)} ${tyR(point.desc)} `;
    }
  }

  return (
    <div>
      <div
        onMouseLeave={() => setTooltip(null)}
        className="w-full"
      >
        <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = pt + ih * (1 - t);
            return (
              <g key={t}>
                <line
                  x1={pl}
                  x2={W - pr}
                  y1={y}
                  y2={y}
                  stroke="#f4f4f5"
                />
                <text
                  x={pl - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={9}
                  fill="#a1a1aa"
                >
                  {Math.round(maxCnt * t)}
                </text>
                <text x={W - pr + 6} y={y + 4} fontSize={9} fill="#a1a1aa">
                  {fc(maxR * t)}
                </text>
              </g>
            );
          })}

          {Array.from({ length: LAST_REAL + 1 }, (_, i) => {
            const point = EVO[i] as EvoPointReal;
            const showStack =
              legendVis.total ||
              REVENUE_STACK_KEYS.some((key) => legendVis[key]);
            if (!showStack) return null;
            return <g key={`stack-${i}`}>{renderRevenueStack(i, point)}</g>;
          })}

          {legendVis.proj
            ? Array.from({ length: n - LAST_REAL - 1 }, (_, offset) => {
                const i = LAST_REAL + 1 + offset;
                const point = EVO[i];
                if (isEvoReal(point)) return null;
                const cx = tx(i);
                const height = (point.projTotal / maxR) * ih;
                const y = pt + ih - height;
                return (
                  <rect
                    key={`proj-${i}`}
                    x={cx - bw / 2}
                    y={y}
                    width={bw}
                    height={Math.max(0, height)}
                    fill={legendColor("proj")}
                    opacity={0.97}
                    rx={2}
                  />
                );
              })
            : null}

          {descPath ? (
            <path
              d={descPath}
              fill="none"
              stroke={legendColor("desc")}
              strokeWidth={2}
            />
          ) : null}
          {countLinePaths}

          {Array.from({ length: n }, (_, i) => (
            <g key={`hit-${i}`}>
              <rect
                x={tx(i) - iw / n / 2}
                y={pt}
                width={iw / n}
                height={ih}
                fill="transparent"
                className="cursor-crosshair"
                onMouseMove={(e) =>
                  showEvoTip(e.clientX, e.clientY, i)
                }
              />
              <text
                x={tx(i)}
                y={H - 14}
                textAnchor="middle"
                fontSize={8}
                fill="#71717a"
              >
                {EVO_LABELS[i]}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mt-3 pt-3 border-t border-zinc-100">
        {LEGEND.map((leg) => {
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
              {leg.type === "line" ? (
                <span
                  className="w-3.5 h-0 border-t-2"
                  style={{ borderColor: leg.c }}
                />
              ) : (
                <span
                  className="size-2 rounded-sm shrink-0"
                  style={{ background: leg.c }}
                />
              )}
              {leg.l}
            </button>
          );
        })}
      </div>

      <ChartTooltipPortal tooltip={tooltip} />
    </div>
  );
}
