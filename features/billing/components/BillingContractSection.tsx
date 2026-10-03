"use client";

import { formatCurrency } from "@/shared/utils/currency";
import type {
  BillingContractDetail,
  BillingFranchiseLine,
  BillingInvoiceDetail,
  BillingManualInvoice,
} from "../types/billing-detail.types";
import type { BillingInvoiceScope } from "../types/billing.types";
import {
  getContractHeaderFields,
  getContractTotalDisplay,
  hasContractMinimumValue,
} from "../utils/billing-detail.utils";
import { BillingContractAdjustmentsBlock } from "./BillingContractAdjustmentsBlock";
import { BillingContractTotalSummary } from "./BillingContractTotalSummary";
import { BillingFranchiseTable } from "./BillingFranchiseTable";
import { BillingInfoField } from "./BillingInfoField";
import { BillingManualInvoiceSection } from "./BillingManualInvoiceSection";

interface BillingContractSectionProps {
  contract: BillingContractDetail;
  invoice: BillingInvoiceDetail;
  scope: BillingInvoiceScope;
  manualInvoices?: BillingManualInvoice[];
  onSendEmail: (franchise: BillingFranchiseLine) => void;
}

/**
 * Seção de contrato no detalhe da fatura.
 */
export function BillingContractSection({
  contract,
  invoice,
  scope,
  manualInvoices = [],
  onSendEmail,
}: BillingContractSectionProps) {
  const headerFields = getContractHeaderFields(scope, contract, invoice);
  const totals = getContractTotalDisplay(contract);
  const { hasAdjustments } = totals;
  const adjustments = contract.adjustments ?? [];
  const deferContractTotal = manualInvoices.length > 0;
  const isExcessOnlyCompetence = contract.isExcessOnlyCompetence === true;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start gap-8">
        <BillingInfoField label="Contrato" value={contract.name} />

        {hasContractMinimumValue(contract) ? (
          <BillingInfoField
            label="Valor mínimo do contrato"
            value={formatCurrency(contract.minimumValue!)}
          />
        ) : null}

        {headerFields.competence ? (
          <BillingInfoField label="Competência" value={headerFields.competence} />
        ) : null}

        {headerFields.dueDate ? (
          <BillingInfoField label="Vencimento" value={headerFields.dueDate} />
        ) : null}
      </div>

      <div>
        {hasAdjustments ? (
          <>
            <BillingFranchiseTable
              franchises={contract.franchises}
              scope={scope}
              onSendEmail={onSendEmail}
              hideBottomBorder
            />

            <BillingContractAdjustmentsBlock
              adjustments={adjustments}
              totals={totals}
              scope={scope}
              hideTotals={deferContractTotal}
              isExcessOnlyCompetence={isExcessOnlyCompetence}
            />
          </>
        ) : (
          <div className="overflow-hidden rounded-lg">
            <BillingFranchiseTable
              franchises={contract.franchises}
              scope={scope}
              onSendEmail={onSendEmail}
            />

            {deferContractTotal ? null : (
              <BillingContractTotalSummary
                totals={totals}
                isExcessOnlyCompetence={isExcessOnlyCompetence}
              />
            )}
          </div>
        )}

        {manualInvoices.length > 0 ? (
          <BillingManualInvoiceSection
            invoices={manualInvoices}
            scope={scope}
            placement="contract"
            embedded
          />
        ) : null}

        {deferContractTotal ? (
          <BillingContractTotalSummary
            totals={totals}
            showSubtotal={hasAdjustments}
            isExcessOnlyCompetence={isExcessOnlyCompetence}
          />
        ) : null}
      </div>
    </section>
  );
}
