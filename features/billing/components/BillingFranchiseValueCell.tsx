"use client";

import { Tooltip } from "@heroui/react";
import { InfoOutlineButton } from "@/shared/components/InfoOutlineIcon";
import {
  HEROUI_TOOLTIP_CONTENT_CLASS_NAMES,
  TOOLTIP_BODY_CLASS,
  TOOLTIP_TITLE_CLASS,
} from "@/shared/constants/tooltip.constants";
import type { BillingFranchiseLine } from "../types/billing-detail.types";
import { buildPriceRangeTooltipModel } from "../utils/billing-detail.utils";

interface PriceRangeTooltipContentProps {
  title: string;
  lines: string[];
}

/**
 * Conteúdo do tooltip de faixas de preço.
 */
export function PriceRangeTooltipContent({ title, lines }: PriceRangeTooltipContentProps) {
  return (
    <div className={`flex flex-col gap-1 px-2 py-1 ${TOOLTIP_BODY_CLASS}`}>
      <span className={TOOLTIP_TITLE_CLASS}>{title}</span>
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </div>
  );
}

interface BillingFranchiseValueCellProps {
  text: string;
  showTooltip: boolean;
  franchise?: BillingFranchiseLine;
}

/**
 * Célula com valor da franquia e tooltip de faixas.
 */
export function BillingFranchiseValueCell({
  text,
  showTooltip,
  franchise,
}: BillingFranchiseValueCellProps) {
  const tooltipModel = showTooltip && franchise ? buildPriceRangeTooltipModel(franchise) : null;

  if (!tooltipModel) {
    return <span>{text}</span>;
  }

  return (
    <div className="flex items-center gap-1">
      <span>{text}</span>
      <Tooltip
        placement="right"
        showArrow
        radius="sm"
        content={<PriceRangeTooltipContent title={tooltipModel.title} lines={tooltipModel.lines} />}
        classNames={HEROUI_TOOLTIP_CONTENT_CLASS_NAMES}
      >
        <InfoOutlineButton aria-label="Ver faixas de valor" />
      </Tooltip>
    </div>
  );
}
