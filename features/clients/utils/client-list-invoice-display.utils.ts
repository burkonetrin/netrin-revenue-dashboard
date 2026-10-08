import type { InvoiceStatusKey } from "@/clientesDashboardMockData";
import type { BillingInvoiceStatusKey } from "@/features/billing/types/billing-invoice-status.types";
import { useClientListInvoiceStatusStore } from "../store/client-list-invoice-status.store";

export function billingStatusToClientInvoiceStatus(
  billingStatus: BillingInvoiceStatusKey,
  fallback: InvoiceStatusKey,
): InvoiceStatusKey {
  if (billingStatus === "fatura_aberta") return "aberta";
  if (billingStatus === "fatura_fechada") return "fatura_fechada";
  if (billingStatus === "faturado") return "enviada_faturar";
  return fallback;
}

export function resolveClientListInvoiceStatus(
  clientId: string,
  seedStatus: InvoiceStatusKey,
): InvoiceStatusKey {
  const billing = useClientListInvoiceStatusStore.getState().getState(clientId);
  return billingStatusToClientInvoiceStatus(billing.status, seedStatus);
}
