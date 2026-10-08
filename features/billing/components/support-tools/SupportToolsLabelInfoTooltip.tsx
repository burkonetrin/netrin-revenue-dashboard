"use client";

import { InfoOutlineButton } from "@/shared/components/InfoOutlineIcon";
import { HEROUI_TOOLTIP_CONTENT_CLASS_NAMES } from "@/shared/constants/tooltip.constants";
import { Tooltip } from "@heroui/react";

export function SupportToolsLabelInfoTooltip({
  label,
  tooltipContent,
  ariaLabel,
}: {
  label: string;
  tooltipContent: string;
  ariaLabel: string;
}) {
  return (
    <span className="inline-flex w-max items-center gap-1 whitespace-nowrap">
      <span>{label}</span>
      <Tooltip
        content={tooltipContent}
        placement="top"
        classNames={HEROUI_TOOLTIP_CONTENT_CLASS_NAMES}
        closeDelay={0}
        delay={200}
      >
        <span className="inline-flex items-center">
          <InfoOutlineButton size="sm" aria-label={ariaLabel} />
        </span>
      </Tooltip>
    </span>
  );
}
