"use client";

import { pctDelta } from "../../clientesDashboardMockFormat";

export function CmpRight({ cur, prev }: { cur: number; prev: number }) {
  const up = cur >= prev;
  const d = Math.abs(pctDelta(cur, prev)).toFixed(1);
  return (
    <span
      className={`text-xs font-medium whitespace-nowrap ${up ? "text-green-600" : "text-red-600"}`}
    >
      {up ? "↑" : "↓"} {d}%
    </span>
  );
}
