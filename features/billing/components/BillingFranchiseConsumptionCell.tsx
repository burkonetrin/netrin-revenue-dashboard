"use client";

import { Tooltip } from "@heroui/react";
import { InfoOutlineButton } from "@/shared/components/InfoOutlineIcon";
import { HEROUI_TOOLTIP_CONTENT_CLASS_NAMES } from "@/shared/constants/tooltip.constants";
import type {
  BillingFranchiseConsumption,
  BillingFranchiseConsumptionInfo,
} from "../types/billing-detail.types";
import { BillingFranchiseConsumptionInfoTooltipContent } from "./BillingFranchiseConsumptionInfoTooltip";

interface BillingFranchiseConsumptionCellProps {
  consumption: BillingFranchiseConsumption;
  consumptionInfo?: BillingFranchiseConsumptionInfo;
}

/**
 * Célula de consumo da franquia com tooltip opcional de consultas Workflow.
 */
export function BillingFranchiseConsumptionCell({
  consumption,
  consumptionInfo,
}: BillingFranchiseConsumptionCellProps) {
  const body = (
    <div className="flex flex-col">
      <span>{consumption.label}</span>
      {consumption.sublabel ? (
        <span className="text-gray-500">{consumption.sublabel}</span>
      ) : null}
    </div>
  );

  if (!consumptionInfo) {
    return body;
  }

  return (
    <div className="flex items-start gap-1">
      {body}
      <Tooltip
        placement="right"
        showArrow
        radius="sm"
        content={<BillingFranchiseConsumptionInfoTooltipContent info={consumptionInfo} />}
        classNames={HEROUI_TOOLTIP_CONTENT_CLASS_NAMES}
      >
        <span className="mt-0.5 inline-flex">
          <InfoOutlineButton aria-label="Detalhes das consultas" size="sm" />
        </span>
      </Tooltip>
    </div>
  );
}