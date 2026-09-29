"use client";

import { useCallback, useState, type ReactNode } from "react";
import {
  ChartTooltipPortal,
  type ChartTooltipState,
} from "../ChartTooltipPortal";

interface MockHoverTipProps {
  content: ReactNode;
  children: ReactNode;
  interactive?: boolean;
}

export function MockHoverTip({
  content,
  children,
  interactive = false,
}: MockHoverTipProps) {
  const [tooltip, setTooltip] = useState<ChartTooltipState | null>(null);

  const show = useCallback(
    (e: React.MouseEvent) => {
      setTooltip({ x: e.clientX, y: e.clientY, content });
    },
    [content],
  );

  const move = useCallback((e: React.MouseEvent) => {
    setTooltip((prev) =>
      prev ? { ...prev, x: e.clientX, y: e.clientY } : null,
    );
  }, []);

  const hide = useCallback(() => setTooltip(null), []);

  return (
    <>
      <span
        className="inline-flex items-center"
        onMouseEnter={show}
        onMouseMove={move}
        onMouseLeave={hide}
      >
        {children}
      </span>
      <ChartTooltipPortal tooltip={tooltip} interactive={interactive} />
    </>
  );
}

interface MockInfoTooltipProps {
  content: ReactNode;
}

export function MockInfoTooltip({ content }: MockInfoTooltipProps) {
  return (
    <MockHoverTip content={content}>
      <button
        type="button"
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-primary bg-white text-[10px] font-medium text-primary cursor-default"
        aria-label="Mais informações"
      >
        i
      </button>
    </MockHoverTip>
  );
}
