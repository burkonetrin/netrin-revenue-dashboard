"use client";

import { ClientInfoHeader } from "@/features/clients/components/ClientInfoHeader";
import { CLIENTS_PERMISSIONS } from "@/features/clients/constants/clientsPermissions.constants";
import { useClientById } from "@/features/clients/hooks/useClientById";
import { usePermission } from "@/shared/hooks/usePermission";
import { useEffect, useMemo, useState } from "react";
import {
  BillingBillSingleClientConfirmModal,
} from "./BillingListConfirmModals";
import { useBillingInvoiceStatusStore } from "../store/billing-invoice-status.store";
import {
  canAdjustBillingInvoice,
  isBillingBillClientEligible,
} from "../utils/billing-invoice-status.utils";
import { canClientsOrBillingInvoice } from "../constants/billingInvoicePermissions.constants";
import {
  buildComprovantesJobKey,
  useBillingComprovantesStore,
} from "../store/billing-comprovantes.store";
import type { BillingFranchiseLine, BillingInvoiceDetail } from "../types/billing-detail.types";
import { getInvoiceMetadataFields, partitionManualInvoices } from "../utils/billing-detail.utils";
import { BillingContractSection } from "./BillingContractSection";
import { BillingInvoiceActions } from "./BillingInvoiceActions";
import { BillingInvoiceAdjustmentsDrawer } from "./BillingInvoiceAdjustmentsDrawer";
import { BillingInvoiceBreadcrumbs } from "./BillingInvoiceBreadcrumbs";
import { BillingInvoiceDescription } from "./BillingInvoiceDescription";
import { BillingInvoiceMetadata } from "./BillingInvoiceMetadata";
import { BillingInvoiceTotalBanner } from "./BillingInvoiceTotalBanner";
import { BillingManualInvoiceSection } from "./BillingManualInvoiceSection";
import { BillingSendConsumptionEmailModal } from "./BillingSendConsumptionEmailModal";

interface BillingInvoiceDetailPageProps {
  invoice: BillingInvoiceDetail;
  source?: "invoice" | "entry";
}

/**
 * Página de detalhe de fatura ou lançamento de faturamento.
 */
export function BillingInvoiceDetailPage({
  invoice,
  source = "invoice",
}: BillingInvoiceDetailPageProps) {
  const [invoiceState, setInvoiceState] = useState(invoice);
  const { can } = usePermission();
  const canReadClient =
    canClientsOrBillingInvoice(can, CLIENTS_PERMISSIONS.invoiceDetailsReadClient) ||
    can(CLIENTS_PERMISSIONS.overview);
  const { scope } = invoiceState.invoiceDetails;
  const { data: client } = useClientById(canReadClient ? invoiceState.clientId : undefined);
  const metadata = getInvoiceMetadataFields(invoiceState);
  const manualInvoices = invoiceState.manualInvoices ?? [];
  const partition = useMemo(
    () => partitionManualInvoices(scope, manualInvoices),
    [manualInvoices, scope],
  );
  const [isAdjustmentsDrawerOpen, setIsAdjustmentsDrawerOpen] = useState(false);
  const [isBillClientModalOpen, setIsBillClientModalOpen] = useState(false);
  const [emailModalFranchise, setEmailModalFranchise] = useState<BillingFranchiseLine | null>(null);

  const statusState = useBillingInvoiceStatusStore((state) =>
    state.getState(source, invoiceState.id),
  );
  const billClient = useBillingInvoiceStatusStore((state) => state.billClient);
  const canAdjust = canAdjustBillingInvoice(statusState.status);
  const canBillClient = isBillingBillClientEligible(statusState.status);

  const jobKey = buildComprovantesJobKey(source, invoiceState.id);
  const isGenerating = useBillingComprovantesStore(
    (state) => state.jobs[jobKey]?.status === "in_progress",
  );
  const generateAndDownloadComprovantes = useBillingComprovantesStore(
    (state) => state.generateAndDownloadComprovantes,
  );

  useEffect(() => {
    setInvoiceState(invoice);
  }, [invoice]);

  return (
    <div className="size-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <BillingInvoiceBreadcrumbs />

        <BillingInvoiceActions
          invoiceId={invoiceState.id}
          source={source}
          onGenerateComprovantes={() => {
            void generateAndDownloadComprovantes({ source, id: invoiceState.id });
          }}
          onAdjustInvoice={() => setIsAdjustmentsDrawerOpen(true)}
          onBillClient={() => setIsBillClientModalOpen(true)}
          isGenerating={isGenerating}
          canAdjustInvoice={canAdjust}
          canBillClient={canBillClient}
        />
      </div>

      <ClientInfoHeader client={client} fallbackName={invoiceState.clientName} headingAs="h2" />

      <h1 className="text-xl font-semibold text-gray-900">Detalhes da fatura</h1>

      {invoiceState.description ? (
        <BillingInvoiceDescription description={invoiceState.description} scope={scope} />
      ) : null}

      <BillingInvoiceMetadata
        competence={metadata.competence}
        dueDate={metadata.dueDate}
        showGlobalMetadata={metadata.showGlobalMetadata}
      />

      {partition.aboveGlobal.length > 0 ? (
        <BillingManualInvoiceSection
          invoices={partition.aboveGlobal}
          scope={scope}
          placement="above"
        />
      ) : null}

      <div className="space-y-6">
        {invoiceState.contracts.map((contract) => (
          <BillingContractSection
            key={contract.id}
            contract={contract}
            invoice={invoiceState}
            scope={scope}
            manualInvoices={partition.byContractId.get(contract.id) ?? []}
            onSendEmail={setEmailModalFranchise}
          />
        ))}
      </div>

      {partition.belowGlobal.length > 0 ? (
        <BillingManualInvoiceSection
          invoices={partition.belowGlobal}
          scope={scope}
          placement="below"
          title="Projetos e setups em notas fiscais separadas"
        />
      ) : null}

      <BillingInvoiceTotalBanner total={invoiceState.invoiceTotal} />

      <BillingSendConsumptionEmailModal
        isOpen={Boolean(emailModalFranchise)}
        franchiseName={emailModalFranchise?.name ?? null}
        source={source}
        billingId={invoiceState.id}
        billingItemId={emailModalFranchise?.billingItemId ?? null}
        onClose={() => setEmailModalFranchise(null)}
      />

      <BillingInvoiceAdjustmentsDrawer
        isOpen={isAdjustmentsDrawerOpen}
        invoice={invoiceState}
        scope={scope}
        onOpenChange={setIsAdjustmentsDrawerOpen}
      />

      <BillingBillSingleClientConfirmModal
        isOpen={isBillClientModalOpen}
        onClose={() => setIsBillClientModalOpen(false)}
        onConfirm={() => {
          billClient(source, invoiceState.id);
          setIsBillClientModalOpen(false);
        }}
      />
    </div>
  );
}
