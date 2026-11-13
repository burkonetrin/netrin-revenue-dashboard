"use client";

import type { ReactNode } from "react";
import {
  type ProductNumbersRow,
  type ProductNumbersSegmentTone,
} from "../../clientesDashboardMockData";
import { fmtN } from "../../clientesDashboardMockFormat";
import { CmpRight } from "./CmpRight";

const HORIZONTAL_GAP = "gap-1.5";

const SEGMENT_TONE_CLASS: Record<ProductNumbersSegmentTone, string> = {
  green: "bg-green-100 text-green-900",
  red: "bg-red-100 text-red-900",
  yellow: "bg-amber-100 text-amber-950",
  grey: "bg-zinc-200 text-zinc-800",
};

const ROW_MIN_HEIGHT_CLASS = "min-h-[56px]";

const EQUAL_TOTALIZER_CARD_CLASS = `flex min-w-0 flex-1 basis-0 flex-col justify-center rounded-sm px-2.5 py-1.5 ${ROW_MIN_HEIGHT_CLASS}`;

function SummaryMetricCard({
  label,
  value,
  growthPct,
}: {
  label: string;
  value: ReactNode;
  growthPct: number;
}) {
  const prev = 100;
  const cur = prev * (1 + growthPct / 100);

  return (
    <div className={`${EQUAL_TOTALIZER_CARD_CLASS} bg-zinc-100`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-medium leading-snug text-zinc-500 whitespace-nowrap truncate min-w-0">
          {label}
        </span>
        <CmpRight
          cur={cur}
          prev={prev}
          className="text-[9px] font-normal shrink-0"
        />
      </div>
      <div className="mt-1 text-sm font-semibold leading-tight tabular-nums text-zinc-900">
        {value}
      </div>
    </div>
  );
}

/** Totalizadores mensais alinhados à legenda do gráfico diário (total + segmentos). */
export function ProductNumbersRowMonthSummary({ row }: { row: ProductNumbersRow }) {
  return (
    <div
      className={`flex items-stretch w-full ${ROW_MIN_HEIGHT_CLASS} ${HORIZONTAL_GAP}`}
    >
      <SummaryMetricCard
        label={row.totalLabel}
        value={fmtN(row.total)}
        growthPct={row.growthPct}
      />
      {row.segments.map((segment) => {
        const prev = 100;
        const cur = prev * (1 + segment.growthPct / 100);

        return (
          <div
            key={segment.label}
            className={`${EQUAL_TOTALIZER_CARD_CLASS} ${SEGMENT_TONE_CLASS[segment.tone]}`}
          >
            <div className="flex items-start justify-between gap-1">
              <span className="text-[9px] font-medium leading-snug whitespace-nowrap truncate min-w-0">
                {segment.label}
              </span>
              <CmpRight
                cur={cur}
                prev={prev}
                className="text-[9px] font-normal shrink-0"
              />
            </div>
            <span className="mt-1 text-[11px] font-semibold leading-tight tabular-nums">
              {fmtN(segment.value)}{" "}
              <span className="font-medium">({segment.sharePct}%)</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
