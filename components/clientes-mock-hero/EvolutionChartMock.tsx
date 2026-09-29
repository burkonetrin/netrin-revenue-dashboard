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
import { CmpRight } from "./CmpRight";

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
            p.total,
            p.acv,
            p.spot,
            p.exc,
            p.mrr,
            p.desc,
            p.projTotal,
          ].filter((x): x is number => x !== undefined);
        }),
      ) * 1.05;
    const maxCntVal =
      Math.max(
        ...slice.flatMap((p) => (isEvoReal(p) ? [p.cl, p.ct, p.fr] : [])),
      ) * 1.1;
    return { maxR: maxRVal, maxCnt: maxCntVal };
  }, []);

  const tx = (i: number) => pl + (i / (n - 1)) * iw;
  const tyR = (v: number) => pt + ih - (v / maxR) * ih;
  const bw = Math.max(6, (iw / n) * 0.28);

  const showEvoTip = useCallback(
    (clientX: number, clientY: number, i: number) => {
      const p = EVO[i];
      const prev = i > 0 ? EVO[i - 1] : p;
      const title = EVO_LABELS[i];
      let content: ReactNode;

      if (i <= LAST_REAL && isEvoReal(p) && isEvoReal(prev)) {
        content = (
          <>
            <div className="font-semibold text-[13px] mb-2">{title}</div>
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
            <div className="font-semibold text-[13px] mb-2">{title}</div>
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

  const linePaths = ["total", "acv", "spot", "exc", "mrr", "desc"].map(
    (key) => {
      if (!legendVis[key]) return null;
      const meta = LEGEND.find((l) => l.id === key);
      let d = "";
      for (let i = 0; i <= LAST_REAL; i++) {
        const pt = EVO[i] as EvoPointReal;
        const v = pt[key as keyof EvoPointReal] as number;
        d += `${i ? "L" : "M"} ${tx(i)} ${tyR(v)} `;
      }
      return (
        <path
          key={key}
          d={d}
          fill="none"
          stroke={meta?.c}
          strokeWidth={2}
          data-series={key}
        />
      );
    },
  );

  let projPath = "";
  if (legendVis.proj) {
    const last = EVO[LAST_REAL] as EvoPointReal;
    projPath = `M ${tx(LAST_REAL)} ${tyR(last.total)}`;
    for (let i = LAST_REAL + 1; i < n; i++) {
      const pt = EVO[i];
      if (!isEvoReal(pt)) {
        projPath += ` L ${tx(i)} ${tyR(pt.projTotal)}`;
      }
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
            const p = EVO[i] as EvoPointReal;
            const cx = tx(i);
            if (!legendVis.fr && !legendVis.ct && !legendVis.cl) return null;
            let y = pt + ih;
            const bars: React.ReactNode[] = [];
            if (legendVis.fr) {
              const h = (p.fr / maxCnt) * ih * 0.35;
              y -= h;
              bars.push(
                <rect
                  key="fr"
                  x={cx - bw / 2}
                  y={y}
                  width={bw}
                  height={h}
                  fill="#22c55e"
                  opacity={0.9}
                  rx={2}
                />,
              );
            }
            if (legendVis.ct) {
              const h = (p.ct / maxCnt) * ih * 0.35;
              y -= h;
              bars.push(
                <rect
                  key="ct"
                  x={cx - bw / 2}
                  y={y}
                  width={bw}
                  height={h}
                  fill="#8456e4"
                  opacity={0.9}
                  rx={2}
                />,
              );
            }
            if (legendVis.cl) {
              const h = (p.cl / maxCnt) * ih * 0.35;
              y -= h;
              bars.push(
                <rect
                  key="cl"
                  x={cx - bw / 2}
                  y={y}
                  width={bw}
                  height={h}
                  fill="#652cdd"
                  opacity={0.9}
                  rx={2}
                />,
              );
            }
            return <g key={i}>{bars}</g>;
          })}

          {linePaths}
          {legendVis.proj && projPath ? (
            <path
              d={projPath}
              fill="none"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
          ) : null}

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
              {leg.type === "dash" ? (
                <span
                  className="w-3.5 h-0 border-t-2 border-dashed"
                  style={{ borderColor: leg.c }}
                />
              ) : (
                <span
                  className="size-2 rounded-full shrink-0"
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
