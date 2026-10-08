"use client";

import { InfoOutlineButton } from "@/shared/components/InfoOutlineIcon";
import { HEROUI_TOOLTIP_CONTENT_CLASS_NAMES } from "@/shared/constants/tooltip.constants";
import { Tooltip } from "@heroui/react";
import { getBillingConsultationCodeDescription } from "../utils/billing-request-consultation.utils";

export function BillingRequestCodeCell({
  statusCode,
  tooltipContent,
}: {
  statusCode: number;
  tooltipContent?: string | null;
}) {
  const codeDescription =
    tooltipContent?.trim() || getBillingConsultationCodeDescription(statusCode);

  return (
    <span className="inline-flex w-max items-center gap-1 whitespace-nowrap">
      <span>{statusCode}</span>
      <Tooltip
        content={codeDescription ?? "—"}
        placement="top"
        classNames={HEROUI_TOOLTIP_CONTENT_CLASS_NAMES}
        closeDelay={0}
        delay={200}
      >
        <span className="inline-flex items-center">
          <InfoOutlineButton size="sm" aria-label={`Descrição do código ${statusCode}`} />
        </span>
      </Tooltip>
    </span>
  );
}
