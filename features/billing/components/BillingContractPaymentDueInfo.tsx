"use client";

import { formatBillingDate } from "../utils/billing.utils";

interface BillingContractPaymentDueInfoProps {
  /** client: nota unificada do cliente; contract: do contrato selecionado */
  owner?: "client" | "contract";
  /** Due date já calculado na entry/invoice da competência (YYYY-MM-DD). */
  billingDueDate?: string | null;
  isLoadingBillingDueDate?: boolean;
}

/**
 * Informativo compacto do próximo vencimento da competência (mesma nota — só leitura).
 */
export function BillingContractPaymentDueInfo({
  owner = "contract",
  billingDueDate,
  isLoadingBillingDueDate = false,
}: BillingContractPaymentDueInfoProps) {
  const ownerLabel = owner === "client" ? "cliente" : "contrato";
  const formattedBillingDueDate = isLoadingBillingDueDate
    ? "Carregando..."
    : billingDueDate
      ? formatBillingDate(billingDueDate)
      : "Não encontrado nesta competência";

  return (
    <div className="space-y-2 rounded-md bg-default-50 p-3">
      <div>
        <p className="text-sm font-medium text-gray-900">
          {owner === "client" ? "Vencimento do cliente" : "Vencimento do contrato"}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          A fatura será incluída na mesma nota; o vencimento segue as informações de pagamento deste{" "}
          {ownerLabel}.
        </p>
      </div>
      <div className="rounded-md bg-white px-3 py-2">
        <p className="text-xs text-zinc-400">Próximo vencimento (faturamento)</p>
        <p className="mt-1 text-sm font-medium text-gray-900">{formattedBillingDueDate}</p>
      </div>
    </div>
  );
}
