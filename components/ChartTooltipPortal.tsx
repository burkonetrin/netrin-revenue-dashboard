"use client";

import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";

export interface ChartTooltipState {
  x: number;
  y: number;
  content: ReactNode;
}

interface ChartTooltipPortalProps {
  tooltip: ChartTooltipState | null;
  /** Permite clicar em botões dentro da tooltip (ex.: NF-e). */
  interactive?: boolean;
}

export function ChartTooltipPortal({
  tooltip,
  interactive = false,
}: ChartTooltipPortalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !tooltip) return null;

  return createPortal(
    <div
      className={`fixed z-[10050] max-w-xs rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg ${
        interactive ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{
        left: tooltip.x,
        top: tooltip.y,
        transform: "translate(-50%, calc(-100% - 10px))",
      }}
    >
      {tooltip.content}
    </div>,
    document.body,
  );
}
