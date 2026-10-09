"use client";

import { ChevronDown } from "lucide-react";

/** Botão de expandir linha — mesmo chevron do `DynamicTable` do Nucleus. */
export function TableExpandButton({
  expanded,
  onClick,
  ariaLabel,
}: {
  expanded: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      className="flex justify-center border-none bg-transparent cursor-pointer p-1"
      aria-label={ariaLabel}
      aria-expanded={expanded}
      onClick={onClick}
    >
      <ChevronDown
        size={20}
        className={`text-gray-400 transition-transform ${
          expanded ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}
