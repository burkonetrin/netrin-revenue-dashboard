"use client";

import { Chip } from "@heroui/react";
import {
  DETAIL_KPIS,
  type MockDiscountBreakdownLine,
  type MockFranchiseTotal12Line,
} from "../../clientesDashboardMockData";
import { fmtDetail, fmtN } from "../../clientesDashboardMockFormat";
import { MockInfoTooltip } from "./MockInfoTooltip";

function DiscountBreakdownTooltip({
  lines,
}: {
  lines: MockDiscountBreakdownLine[];
}) {
  return (
    <div className="text-[13px] space-y-3">
      {lines.map((line) => (
        <div key={`${line.kind}-${line.name}`}>
          <p className="font-semibold text-zinc-900 m-0">{line.kind}:</p>
          <p className="text-zinc-600 m-0 mt-0.5">
            {line.name}: {fmtDetail(line.value)}
          </p>
        </div>
      ))}
    </div>
  );
}

function Total12FranchisesTooltip({
  lines,
}: {
  lines: MockFranchiseTotal12Line[];
}) {
  return (
    <div className="text-[13px] space-y-3">
      {lines.map((line) => (
        <div key={line.name}>
          <p className="font-semibold text-zinc-900 m-0">{line.name}</p>
          <p className="text-zinc-600 m-0 mt-0.5">
            {fmtDetail(line.value)} · {fmtN(line.consultas)} consultas
          </p>
        </div>
      ))}
    </div>
  );
}

export function DetailKpiGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-2.5 mb-5">
      {DETAIL_KPIS.map((k) => {
        const val = k.pct ? `${k.c}%` : fmtDetail(k.c);
        return (
          <div
            key={k.l}
            className="rounded-[10px] border border-zinc-200 bg-white px-3 py-2.5"
          >
            <span className="block text-[11px] text-zinc-500 mb-1.5 leading-tight">
              {k.l}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[15px] font-semibold">{val}</span>
              {k.total12FranchiseBreakdown?.length ? (
                <MockInfoTooltip
                  content={
                    <Total12FranchisesTooltip
                      lines={k.total12FranchiseBreakdown}
                    />
                  }
                />
              ) : null}
              {k.discountBreakdown?.length ? (
                <MockInfoTooltip
                  content={
                    <DiscountBreakdownTooltip lines={k.discountBreakdown} />
                  }
                />
              ) : null}
              {k.chip ? (
                <Chip
                  size="sm"
                  variant="flat"
                  classNames={{
                    base: "bg-primary-50 text-primary h-auto",
                    content: "text-[11px] font-medium",
                  }}
                >
                  {k.chip}
                </Chip>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
