"use client";

import type { ReactNode } from "react";

interface ChartCardProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
  bodyClassName?: string;
}

/** Card de gráfico — padrão Nucleus (borda + fundo branco). */
export function ChartCard({
  title,
  subtitle,
  className = "",
  children,
  bodyClassName = "",
}: ChartCardProps) {
  return (
    <div
      className={`rounded-xl border border-default-200 bg-white p-5 shadow-sm ${className}`.trim()}
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
