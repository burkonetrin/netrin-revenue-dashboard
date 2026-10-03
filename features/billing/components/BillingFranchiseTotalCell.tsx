"use client";

import { formatCurrency } from "@/shared/utils/currency";
import { Tooltip } from "@heroui/react";
import { InfoOutlineButton } from "@/shared/components/InfoOutlineIcon";
import {
  HEROUI_TOOLTIP_CONTENT_CLASS_NAMES,
  TOOLTIP_BODY_CLASS,
} from "@/shared/constants/tooltip.constants";
import type { BillingFranchiseLine } from "../types/billing-detail.types";

const EXCESS_ONLY_TOOLTIP_LINES = [
  "O valor desta franquia já foi faturado anteriormente.",
  "Esta competência está faturando apenas o excedente",
] as const;

interface BillingFranchiseTotalCellProps {
  franchise: BillingFranchiseLine;
}

/**
 * Célula de total da franquia, com tooltip quando a competência fatura só excedente.
 */
export function BillingFranchiseTotalCell({ franchise }: BillingFranchiseTotalCellProps) {
  const totalText = formatCurrency(franchise.total);

  if (!franchise.isExcessOnlyBilling) {
    return <span>{totalText}</span>;
  }

  return (
    <div className="flex items-center gap-1">
      <span>{totalText}</span>
      <Tooltip
        placement="right"
        showArrow
        radius="sm"
        content={
          <div className={`flex flex-col gap-1 px-2 py-1 ${TOOLTIP_BODY_CLASS}`}>
            {EXCESS_ONLY_TOOLTIP_LINES.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        }
        classNames={HEROUI_TOOLTIP_CONTENT_CLASS_NAMES}
      >
        <InfoOutlineButton aria-label="Informação sobre total faturando apenas excedente" />
      </Tooltip>
    </div>
  );
}
