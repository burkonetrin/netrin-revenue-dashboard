"use client";

import { CLIENTS_PERMISSIONS } from "@/features/clients/constants/clientsPermissions.constants";
import { usePermission } from "@/shared/hooks/usePermission";
import { Button } from "@heroui/react";
import { FileText, Lock, Receipt, Settings2 } from "lucide-react";
import { canClientsOrBillingInvoice } from "../constants/billingInvoicePermissions.constants";
import type { BillingRecordSource } from "../mock/billingMockStore";
import { useBillingInvoiceStatusStore } from "../store/billing-invoice-status.store";

interface BillingInvoiceActionsProps {
  invoiceId: string;
  source: BillingRecordSource;
  onGenerateComprovantes: () => void;
  onAdjustInvoice: () => void;
  onBillClient?: () => void;
  isGenerating?: boolean;
  canAdjustInvoice?: boolean;
  canBillClient?: boolean;
}

/**
 * Ações disponíveis no detalhe da fatura.
 */
export function BillingInvoiceActions({
  invoiceId,
  source,
  onGenerateComprovantes,
  onAdjustInvoice,
  onBillClient,
  isGenerating = false,
  canAdjustInvoice = true,
  canBillClient = false,
}: BillingInvoiceActionsProps) {
  const { can } = usePermission();
  const statusState = useBillingInvoiceStatusStore((state) => state.getState(source, invoiceId));
  const setClosed = useBillingInvoiceStatusStore((state) => state.setClosed);

  const canGenerateHistory = canClientsOrBillingInvoice(can, CLIENTS_PERMISSIONS.generateHistory);

  const canShowAdjust =
    canAdjustInvoice &&
    canClientsOrBillingInvoice(can, CLIENTS_PERMISSIONS.adjustInvoice) &&
    [
      CLIENTS_PERMISSIONS.adjustDiscount,
      CLIENTS_PERMISSIONS.adjustAddition,
      CLIENTS_PERMISSIONS.adjustDueDate,
      CLIENTS_PERMISSIONS.adjustCompetence,
      CLIENTS_PERMISSIONS.adjustDescription,
    ].some((permission) => canClientsOrBillingInvoice(can, permission));

  const canToggleClose =
    !statusState.closeCheckboxLocked &&
    (statusState.status === "fatura_aberta" || statusState.status === "fatura_fechada");
  const isClosed = statusState.status === "fatura_fechada";

  return (
    <div className="flex shrink-0 items-center gap-2">
      {canGenerateHistory && (
        <Button
          radius="sm"
          variant="bordered"
          isDisabled={isGenerating}
          isLoading={isGenerating}
          startContent={isGenerating ? undefined : <FileText size={18} className="text-gray-400" />}
          onPress={onGenerateComprovantes}
        >
          {isGenerating ? "Gerando comprovantes..." : "Gerar comprovantes"}
        </Button>
      )}

      {canToggleClose ? (
        <Button
          radius="sm"
          variant="bordered"
          startContent={<Lock size={18} className="text-gray-400" />}
          onPress={() => setClosed(source, invoiceId, !isClosed)}
        >
          {isClosed ? "Reabrir fatura" : "Fechar fatura"}
        </Button>
      ) : null}

      {canShowAdjust && (
        <Button
          radius="sm"
          variant="bordered"
          startContent={<Settings2 size={18} className="text-gray-400" />}
          onPress={onAdjustInvoice}
        >
          Ajustar fatura
        </Button>
      )}

      {canBillClient && onBillClient ? (
        <Button
          radius="sm"
          variant="bordered"
          startContent={<Receipt size={18} className="text-gray-400" />}
          onPress={onBillClient}
        >
          Faturar cliente
        </Button>
      ) : null}
    </div>
  );
}
