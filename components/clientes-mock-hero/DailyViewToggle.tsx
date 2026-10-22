"use client";

import { ChevronDown } from "lucide-react";

export function DailyViewToggle({
  expanded,
  onToggle,
  ariaLabel,
  className = "",
}: {
  expanded: boolean;
  onToggle: () => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`mt-1 flex items-center gap-0.5 whitespace-nowrap border-none bg-transparent p-0 text-[9px] font-medium leading-snug text-zinc-500 hover:text-zinc-700 ${className}`.trim()}
      aria-expanded={expanded}
      aria-label={ariaLabel}
      onClick={onToggle}
    >
      Visão diária
      <ChevronDown
        className={`size-3 shrink-0 transition-transform ${
          expanded ? "rotate-180" : ""
        }`}
        aria-hidden
      />
    </button>
  );
}
