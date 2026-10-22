"use client";

import { pctDelta } from "../../clientesDashboardMockFormat";

export function CmpRight({
  cur,
  prev,
  className = "text-xs font-medium",
}: {
  cur: number;
  prev: number;
  className?: string;
}) {
  const up = cur >= prev;
  const d = Math.abs(pctDelta(cur, prev)).toFixed(1);
  return (
    <span
      className={`whitespace-nowrap tabular-nums ${className} ${up ? "text-green-600" : "text-red-600"}`}
    >
      {up ? "↑" : "↓"} {d}%
    </span>
  );
}
