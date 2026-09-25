"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { formatCurrency, formatPercent } from "../utils/format";
import { percentChange } from "../utils/comparison";

interface KpiComparisonBadgeProps {
  current: number;
  previous: number;
  isPercent?: boolean;
  isCurrency?: boolean;
}

export function KpiComparisonBadge({
  current,
  previous,
  isPercent,
  isCurrency,
}: KpiComparisonBadgeProps) {
  const delta = percentChange(current, previous);
  const up = current >= previous;
  const color = up ? "text-emerald-600" : "text-red-600";
  const Icon = up ? ArrowUp : ArrowDown;

  const formatValue = (v: number) => {
    if (isPercent) return formatPercent(v);
    if (isCurrency) return formatCurrency(v);
    return v.toLocaleString("pt-BR");
  };

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <span className="text-zinc-500 font-normal">{formatValue(previous)}</span>
      <Icon className="size-3 shrink-0" aria-hidden />
      <span>{Math.abs(delta).toFixed(1)}%</span>
    </span>
  );
}
