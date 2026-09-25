"use client";

import type { ReactNode } from "react";

interface ChartCardProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
  bodyClassName?: string;
}

/** Card de gráfico/listagem — espelha `.card` do mock HTML offline. */
export function ChartCard({
  title,
  subtitle,
  className = "",
  children,
  bodyClassName = "",
}: ChartCardProps) {
  return (
    <div
      className={`bg-white border border-zinc-200 rounded-xl p-5 mb-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-visible ${className}`}
    >
      {title ? (
        <h2 className="text-base font-semibold text-zinc-900 m-0 mb-4">{title}</h2>
      ) : null}
      {subtitle ? (
        <p className="text-sm text-zinc-500 m-0 mb-3">{subtitle}</p>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
