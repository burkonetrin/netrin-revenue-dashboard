"use client";

import { addToast } from "@heroui/react";
import { useMemo, useState } from "react";
import { PaymentInfoForm } from "../../components/PaymentInfoForm";
import type { PaymentInfoFormValues } from "../../types/contractsFranchises.types";
import { officialPaymentInfoDefaults } from "../utils/officialPaymentInfoDefaults";
import type { PaymentOwner } from "../types/paymentInfoTab.types";
import { PaymentInfoSidebarShell } from "./PaymentInfoSidebarShell";
import { SidebarContextHeader } from "./SidebarContextHeader";

const FORM_ID = "payment-info-tab-form";

export interface ClientPaymentInfoEditSidebarState {
  owner: PaymentOwner;
  contractName?: string;
  franchiseName?: string;
}

interface ClientPaymentInfoEditSidebarProps {
  sidebar: ClientPaymentInfoEditSidebarState | null;
  onClose: () => void;
}

/**
 * Sidebar de edição de pagamento no protótipo (shell + form iguais ao Nucleus).
 */
export function ClientPaymentInfoEditSidebar({
  sidebar,
  onClose,
}: ClientPaymentInfoEditSidebarProps) {
  const [isSaving, setIsSaving] = useState(false);
  const isOpen = Boolean(sidebar);
  const owner = sidebar?.owner;
  const defaultValues = useMemo(() => officialPaymentInfoDefaults(), []);

  const contextHeader = owner ? (
    <SidebarContextHeader
      owner={owner}
      contractName={sidebar?.contractName}
      franchiseName={sidebar?.franchiseName}
    />
  ) : null;

  const handlePaymentSubmit = async (_values: PaymentInfoFormValues) => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      addToast({
        title: "Informações salvas",
        description: "Pagamento atualizado no protótipo comercial.",
        color: "success",
        timeout: 3000,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!owner) {
    return (
      <PaymentInfoSidebarShell isOpen={false} onClose={onClose} hideFooter />
    );
  }

  return (
    <PaymentInfoSidebarShell
      isOpen={isOpen}
      onClose={onClose}
      isSaving={isSaving}
      formId={FORM_ID}
      contextHeader={contextHeader}
    >
      <PaymentInfoForm
        key={`${owner.type}-${JSON.stringify(owner)}`}
        id={FORM_ID}
        defaultValues={defaultValues}
        showProfitCenterFields={false}
        disableAutoReset={isSaving}
        onSubmit={handlePaymentSubmit}
      />
    </PaymentInfoSidebarShell>
  );
}