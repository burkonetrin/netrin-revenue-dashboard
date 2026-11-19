"use client";

import type { ReactNode } from "react";
import { Chip } from "@heroui/react";
import { MockHoverTip } from "./MockInfoTooltip";
import { TOOLTIP_BODY_CLASS } from "@/shared/constants/tooltip.constants";

export function ClientListOverflowChip({
  count,
  content,
  ariaLabel,
}: {
  count: number;
  content: ReactNode;
  ariaLabel: string;
}) {
  if (count <= 0) return null;
  return (
    <MockHoverTip content={<div className={TOOLTIP_BODY_CLASS}>{content}</div>}>
      <Chip
        size="sm"
        variant="flat"
        aria-label={ariaLabel}
        classNames={{
          base: "bg-zinc-100 text-zinc-700 h-auto shrink-0 cursor-default",
          content: "text-[10px] font-medium px-1.5 py-0.5",
        }}
      >
        + {count}
      </Chip>
    </MockHoverTip>
  );
}