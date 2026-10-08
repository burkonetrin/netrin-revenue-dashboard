"use client";

import type { ReactNode } from "react";

interface SupportToolsFilterFieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
}

/** Label fixo acima do campo (sempre visível), alinhado aos filtros de faturamento. */
export function SupportToolsFilterField({ label, children, hint }: SupportToolsFilterFieldProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <span className="text-sm text-default-500">{label}</span>
      {children}
      {hint ? <p className="text-xs text-default-400">{hint}</p> : null}
    </div>
  );
}
