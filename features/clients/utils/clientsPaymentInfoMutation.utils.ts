import { reassessBillingClient } from "@/features/billing/services/billing-reassessment.service";
import { type ErrorResponse, getErrorMessage } from "@/shared/utils/errorParser";
import { addToast } from "@heroui/react";
import type { QueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

const activeReassessments = new Map<string, Promise<void>>();
const PAYMENT_INFO_UPDATE_ERROR = "Erro ao atualizar. Tente novamente";

export async function reassessBillingAfterPaymentInfo(
  clientId: string,
  shouldReassess: boolean,
  queryClient: QueryClient,
): Promise<void> {
  if (!shouldReassess) return;
  const current = activeReassessments.get(clientId);
  if (current) return current;
  const operation = (async () => {
    try {
      await reassessBillingClient(clientId);
      await queryClient.invalidateQueries({ queryKey: ["billing"] });
    } catch (error) {
      addToast({ title: PAYMENT_INFO_UPDATE_ERROR, color: "danger" });
      throw error;
    }
  })()
    .finally(() => {
      if (activeReassessments.get(clientId) === operation) activeReassessments.delete(clientId);
    });
  activeReassessments.set(clientId, operation);
  return operation;
}

/** Invalida queries base de pagamento e detalhe do cliente. */
export function invalidateClientPaymentBase(queryClient: QueryClient, clientId: string) {
  void queryClient.invalidateQueries({ queryKey: ["clients", "detail", clientId] });
  void queryClient.invalidateQueries({
    queryKey: ["clients", clientId, "payment-infos-status"],
  });
  invalidateClientPaymentInfoTabStatus(queryClient, clientId);
}

/** Invalida o resumo usado pelo alerta global de informações pendentes. */
export function invalidateClientPaymentInfoTabStatus(
  queryClient: QueryClient,
  clientId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: ["clients", clientId, "payment-info-tab", "status"],
  });
}

/** Invalida payment info do cliente após mutação. */
export function invalidateClientPaymentInfo(queryClient: QueryClient, clientId: string) {
  invalidateClientPaymentBase(queryClient, clientId);
  void queryClient.invalidateQueries({ queryKey: ["clients", clientId, "payment-info"] });
}

/** Invalida payment info do contrato após mutação. */
export function invalidateContractPaymentInfo(
  queryClient: QueryClient,
  clientId: string,
  contractId: string,
) {
  invalidateClientPaymentBase(queryClient, clientId);
  void queryClient.invalidateQueries({
    queryKey: ["clients", clientId, "contract", contractId, "payment-info"],
  });
}

/** Invalida payment info da franquia após mutação. */
export function invalidateDeductiblePaymentInfo(
  queryClient: QueryClient,
  clientId: string,
  contractId: string,
  deductibleId: string,
) {
  invalidateClientPaymentBase(queryClient, clientId);
  void queryClient.invalidateQueries({
    queryKey: [
      "clients",
      clientId,
      "contract",
      contractId,
      "deductible",
      deductibleId,
      "payment-info",
    ],
  });
}

/** Toast de sucesso ao salvar informações de pagamento. */
export function showPaymentInfoSaveSuccessToast() {
  addToast({
    title: "Informações de pagamento salvas",
    color: "success",
  });
}

/** Toast de erro ao salvar informações de pagamento. */
export function showPaymentInfoSaveErrorToast(error: AxiosError<ErrorResponse>) {
  addToast({
    title: "Erro ao salvar",
    description: getErrorMessage(error, "Não foi possível salvar as informações de pagamento."),
    color: "danger",
  });
}
