"use client";

import { formatCurrency } from "@/shared/utils/currency";
import { Chip } from "@heroui/react";
import type { BillingInvoiceAdjustment } from "../types/billing-detail.types";
import type { BillingInvoiceScope } from "../types/billing.types";
import { formatFranchiseAdjustmentDescription } from "../utils/billing-adjustment.utils";
import { type ContractTotalDisplay, getAdjustmentRowColSpan } from "../utils/billing-detail.utils";
import { BillingContractTotalSummary } from "./BillingContractTotalSummary";

interface BillingContractAdjustmentsBlockProps {
  adjustments: BillingInvoiceAdjustment[];
  totals: ContractTotalDisplay;
  scope: BillingInvoiceScope;
  hideTotals?: boolean;
  isExcessOnlyCompetence?: boolean;
}

const CELL_CLASS = "px-3 py-3 text-xs align-middle bg-white";
const DESCRIPTION_CELL_CLASS = `${CELL_CLASS} text-right text-gray-900`;
const AMOUNT_CELL_CLASS = `${CELL_CLASS} w-[110px] whitespace-nowrap text-right text-gray-900`;
const BADGE_CELL_CLASS = `${CELL_CLASS} w-[113px] whitespace-nowrap text-center`;
const AMOUNT_COLUMN_WIDTH = "110px";
const BADGE_COLUMN_WIDTH = "113px";

function getAdjustmentTypeLabel(type: BillingInvoiceAdjustment["type"]) {
  return type === "discount" ? "Desconto" : "Acréscimo";
}

/**
 * Bloco de descontos/acréscimos e totais do contrato, alinhado à tabela de franquias.
 */
export function BillingContractAdjustmentsBlock({
  adjustments,
  totals,
  scope,
  hideTotals = false,
  isExcessOnlyCompetence = false,
}: BillingContractAdjustmentsBlockProps) {
  if (adjustments.length === 0) {
    return null;
  }

  const descriptionColSpan = getAdjustmentRowColSpan(scope);

  return (
    <div className="mt-1 overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full table-fixed">
        <colgroup>
          {Array.from({ length: descriptionColSpan }).map((_, index) => (
            <col key={`description-${index}`} />
          ))}
          <col style={{ width: AMOUNT_COLUMN_WIDTH }} />
          <col style={{ width: BADGE_COLUMN_WIDTH }} />
        </colgroup>
        <tbody>
          {adjustments.map((adjustment) => (
            <tr key={adjustment.id} className="border-b border-gray-200">
              <td colSpan={descriptionColSpan} className={DESCRIPTION_CELL_CLASS}>
                {adjustment.franchiseName
                  ? formatFranchiseAdjustmentDescription(
                      adjustment.franchiseName,
                      adjustment.description,
                    )
                  : adjustment.description}
              </td>
              <td className={AMOUNT_CELL_CLASS}>{formatCurrency(adjustment.amount)}</td>
              <td className={BADGE_CELL_CLASS}>
                <Chip size="sm" variant="flat" className="bg-default-100 text-gray-700">
                  {getAdjustmentTypeLabel(adjustment.type)}
                </Chip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {hideTotals ? null : (
        <BillingContractTotalSummary
          totals={totals}
          showSubtotal
          isExcessOnlyCompetence={isExcessOnlyCompetence}
        />
      )}
    </div>
  );
}
