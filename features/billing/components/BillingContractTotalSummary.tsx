"use client";

import { formatCurrency } from "@/shared/utils/currency";
import { Tooltip } from "@heroui/react";
import { InfoOutlineButton } from "@/shared/components/InfoOutlineIcon";
import {
  HEROUI_TOOLTIP_CONTENT_CLASS_NAMES,
  TOOLTIP_BODY_CLASS,
} from "@/shared/constants/tooltip.constants";
import type { ContractTotalDisplay } from "../utils/billing-detail.utils";

/** Copy Figma 6215-90325 — tooltip do Total do contrato (REQ-3 / CMV-02). */
export const EXCESS_ONLY_CONTRACT_TOOLTIP_LINES = [
  "O valor deste contrato já foi faturado anteriormente.",
  "Esta competência está faturando apenas o excedente",
] as const;

interface BillingContractTotalSummaryProps {
  totals: ContractTotalDisplay;
  showSubtotal?: boolean;
  className?: string;
  /** Competência só-excedente do contrato — exibe ícone info + tooltip (CMV-03). */
  isExcessOnlyCompetence?: boolean;
}

function ContractTotalAmount({
  amount,
  isExcessOnlyCompetence,
  className,
}: {
  amount: number;
  isExcessOnlyCompetence?: boolean;
  className?: string;
}) {
  const totalText = formatCurrency(amount);

  if (!isExcessOnlyCompetence) {
    return <p className={className}>{totalText}</p>;
  }

  return (
    <div className={`flex items-center justify-end gap-1 ${className ?? ""}`.trim()}>
      <span className="font-bold text-gray-900">{totalText}</span>
      <Tooltip
        placement="right"
        showArrow
        radius="sm"
        content={
          <div className={`flex flex-col gap-1 px-2 py-1 ${TOOLTIP_BODY_CLASS}`}>
            {EXCESS_ONLY_CONTRACT_TOOLTIP_LINES.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        }
        classNames={HEROUI_TOOLTIP_CONTENT_CLASS_NAMES}
      >
        <InfoOutlineButton aria-label="Informação sobre total do contrato faturando apenas excedente" />
      </Tooltip>
    </div>
  );
}

/**
 * Resumo de totais do contrato no detalhe da fatura.
 */
export function BillingContractTotalSummary({
  totals,
  showSubtotal = false,
  className = "",
  isExcessOnlyCompetence = false,
}: BillingContractTotalSummaryProps) {
  if (showSubtotal) {
    return (
      <div className={`rounded-b-lg bg-default-50 px-4 py-3 ${className}`.trim()}>
        <div className="flex flex-col items-end gap-3 text-right text-sm">
          <div>
            <p className="text-gray-600">{totals.subtotalLabel}</p>
            <p className="font-medium text-gray-900">{formatCurrency(totals.subtotalAmount)}</p>
          </div>
          <div>
            <p className="text-gray-900">{totals.totalLabel}</p>
            <ContractTotalAmount
              amount={totals.totalAmount}
              isExcessOnlyCompetence={isExcessOnlyCompetence}
              className="text-base font-bold text-gray-900"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex justify-end rounded-b-lg border-t border-gray-200 bg-default-50 px-4 py-3 ${className}`.trim()}
    >
      <div className="text-right text-sm">
        <p className="text-gray-900">{totals.totalLabel}</p>
        <ContractTotalAmount
          amount={totals.totalAmount}
          isExcessOnlyCompetence={isExcessOnlyCompetence}
          className="font-bold text-gray-900"
        />
      </div>
    </div>
  );
}
