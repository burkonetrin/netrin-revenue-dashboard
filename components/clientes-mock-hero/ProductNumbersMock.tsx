"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { PieChart } from "lucide-react";
import {
  PRODUCT_NUMBERS_ROWS,
  type ProductNumbersSegmentTone,
} from "../../clientesDashboardMockData";
import {
  fmt,
  fmtN,
  parseCompetenceMonthYear,
} from "../../clientesDashboardMockFormat";
import { CmpRight } from "./CmpRight";
import { DailyViewToggle } from "./DailyViewToggle";
import { ProductNumbersDailyChart } from "./ProductNumbersDailyChart";

const HORIZONTAL_GAP = "gap-1.5";

const SEGMENT_TONE_CLASS: Record<ProductNumbersSegmentTone, string> = {
  green: "bg-green-100 text-green-900",
  red: "bg-red-100 text-red-900",
  yellow: "bg-amber-100 text-amber-950",
  grey: "bg-zinc-200 text-zinc-800",
};

const ROW_MIN_HEIGHT_CLASS = "min-h-[56px]";

/** Largura base do card; cresce só se o conteúdo precisar de mais espaço. */
const SUMMARY_CARD_CLASS = `flex w-[9.25rem] shrink-0 min-w-[max(9.25rem,max-content)] flex-col justify-center rounded-sm bg-zinc-100 px-2.5 py-1.5 ${ROW_MIN_HEIGHT_CLASS}`;

const FATURAMENTO_CARD_CLASS = `flex w-[11rem] shrink-0 min-w-[max(11rem,max-content)] flex-col justify-center rounded-sm bg-zinc-100 px-2.5 py-1.5 ${ROW_MIN_HEIGHT_CLASS}`;

const SEGMENT_CARD_CLASS = `flex min-w-[max(6.25rem,max-content)] shrink-0 flex-col justify-center rounded-sm px-2.5 py-1.5 ${ROW_MIN_HEIGHT_CLASS}`;

const TOTAL_FATURAMENTO = PRODUCT_NUMBERS_ROWS.reduce(
  (sum, row) => sum + row.faturamento,
  0,
);

function faturamentoSharePct(faturamento: number): number {
  if (TOTAL_FATURAMENTO <= 0) return 0;
  return Math.round((faturamento / TOTAL_FATURAMENTO) * 100);
}

const ROWS_BY_FATURAMENTO_DESC = [...PRODUCT_NUMBERS_ROWS].sort(
  (a, b) => b.faturamento - a.faturamento,
);

function SummaryMetricCard({
  label,
  value,
  growthPct,
  className = SUMMARY_CARD_CLASS,
}: {
  label: string;
  value: ReactNode;
  growthPct: number;
  className?: string;
}) {
  const prev = 100;
  const cur = prev * (1 + growthPct / 100);

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-medium leading-snug text-zinc-500 whitespace-nowrap">
          {label}
        </span>
        <CmpRight cur={cur} prev={prev} className="text-[9px] font-normal" />
      </div>
      <div className="mt-1 text-sm font-semibold leading-tight tabular-nums text-zinc-900">
        {value}
      </div>
    </div>
  );
}

type ProductNumbersMockProps = {
  competenceLabel: string;
};

export function ProductNumbersMock({ competenceLabel }: ProductNumbersMockProps) {
  const { year, month } = useMemo(
    () => parseCompetenceMonthYear(competenceLabel),
    [competenceLabel],
  );
  const [dailyOpen, setDailyOpen] = useState<Record<string, boolean>>({});

  const toggleDaily = useCallback((productCode: string) => {
    setDailyOpen((prev) => ({
      ...prev,
      [productCode]: !prev[productCode],
    }));
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {ROWS_BY_FATURAMENTO_DESC.map((row) => {
        const isDailyOpen = Boolean(dailyOpen[row.productCode]);

        return (
          <div key={row.productCode} className="flex flex-col">
            <div className={`flex items-stretch ${ROW_MIN_HEIGHT_CLASS} ${HORIZONTAL_GAP}`}>
              <div className="flex w-[4.75rem] shrink-0 flex-col items-stretch gap-0.5">
                <div
                  className="flex min-h-[40px] flex-1 items-center justify-center rounded-sm bg-[#652cdd] text-[11px] font-bold leading-none text-white"
                  aria-hidden
                >
                  {row.productCode}
                </div>
                <DailyViewToggle
                  className="justify-center"
                  expanded={isDailyOpen}
                  ariaLabel={`${isDailyOpen ? "Ocultar" : "Exibir"} visão diária de ${row.productCode}`}
                  onToggle={() => toggleDaily(row.productCode)}
                />
              </div>

              <SummaryMetricCard
                className={FATURAMENTO_CARD_CLASS}
                label="Faturamento"
                value={
                  <span className="flex w-full items-baseline justify-between gap-2 whitespace-nowrap">
                    <span>{fmt(row.faturamento)}</span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold tabular-nums text-zinc-500">
                      <PieChart
                        className="size-3 shrink-0"
                        strokeWidth={2}
                        aria-hidden
                      />
                      {faturamentoSharePct(row.faturamento)}%
                    </span>
                  </span>
                }
                growthPct={row.faturamentoGrowthPct}
              />

              <SummaryMetricCard
                label={row.totalLabel}
                value={fmtN(row.total)}
                growthPct={row.growthPct}
              />

              <div className={`flex min-w-0 flex-1 ${HORIZONTAL_GAP}`}>
                {row.segments.map((segment) => {
                  const prev = 100;
                  const cur = prev * (1 + segment.growthPct / 100);

                  return (
                    <div
                      key={segment.label}
                      className={`${SEGMENT_CARD_CLASS} ${SEGMENT_TONE_CLASS[segment.tone]}`}
                      style={{ flex: `${segment.sharePct} 0 0` }}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[9px] font-medium leading-snug whitespace-nowrap">
                          {segment.label}
                        </span>
                        <CmpRight
                          cur={cur}
                          prev={prev}
                          className="text-[9px] font-normal shrink-0"
                        />
                      </div>
                      <span className="mt-1 text-[11px] font-semibold leading-tight tabular-nums whitespace-nowrap">
                        {fmtN(segment.value)}{" "}
                        <span className="font-medium">({segment.sharePct}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {isDailyOpen ? (
              <div className="mt-4">
                <ProductNumbersDailyChart row={row} year={year} month={month} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
