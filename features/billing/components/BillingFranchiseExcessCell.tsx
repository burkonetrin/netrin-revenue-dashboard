"use client";

import type { ReactNode } from "react";
import { Tooltip } from "@heroui/react";
import { InfoOutlineButton } from "@/shared/components/InfoOutlineIcon";
import { formatCurrency } from "@/shared/utils/currency";
import { HEROUI_TOOLTIP_CONTENT_CLASS_NAMES } from "@/shared/constants/tooltip.constants";
import type { BillingFranchiseLine } from "../types/billing-detail.types";
import { BillingFranchiseConsumptionInfoTooltipContent } from "./BillingFranchiseConsumptionInfoTooltip";

interface BillingFranchiseExcessCellProps {
  franchise: BillingFranchiseLine;
}

/**
 * Célula de excedente da franquia (label + valor em sublabel cinza, quando houver).
 */
export function BillingFranchiseExcessCell({ franchise }: BillingFranchiseExcessCellProps) {
  const excessInfo = franchise.excessInfo;

  let body: ReactNode;

  if (franchise.excessLabel) {
    body = (
      <div className="flex flex-col">
        <span>{franchise.excessLabel}</span>
        {franchise.excessSublabel ? (
          <span className="text-gray-500">{franchise.excessSublabel}</span>
        ) : null}
      </div>
    );
  } else if (franchise.excessSublabel) {
    body = <span>{franchise.excessSublabel}</span>;
  } else {
    body = <span>{formatCurrency(franchise.excessAmount)}</span>;
  }

  const hasExcess =
    franchise.excessAmount > 0 ||
    Boolean(franchise.excessLabel?.trim()) ||
    Boolean(franchise.excessSublabel?.trim());

  if (!excessInfo || !hasExcess) {
    return body;
  }

  return (
    <div className="flex items-start gap-1">
      {body}
      <Tooltip
        placement="right"
        showArrow
        radius="sm"
        content={<BillingFranchiseConsumptionInfoTooltipContent info={excessInfo} />}
        classNames={HEROUI_TOOLTIP_CONTENT_CLASS_NAMES}
      >
        <span className="mt-0.5 inline-flex">
          <InfoOutlineButton aria-label="Detalhes das consultas por Workflow" size="sm" />
        </span>
      </Tooltip>
    </div>
  );
}