import type { QueryClient } from "@tanstack/react-query";
import { type ErrorResponse, getErrorMessage } from "@/shared/utils/errorParser";
import { addToast } from "@heroui/react";
import type { AxiosError } from "axios";

/** Query key do centro de lucro da franquia. */
export function deductibleProfitCenterQueryKey(
  clientId: string,
  contractId: string,
  deductibleId: string,
) {
  return [
    "clients",
    clientId,
    "contract",
    contractId,
    "deductible",
    deductibleId,
    "profit-center",
  ] as const;
}

/** Invalida o cache do centro de lucro da franquia. */
export function invalidateDeductibleProfitCenter(
  queryClient: QueryClient,
  clientId: string,
  contractId: string,
  deductibleId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: deductibleProfitCenterQueryKey(clientId, contractId, deductibleId),
  });
}

/** Toast de sucesso ao salvar centro de lucro. */
export function showProfitCenterSaveSuccessToast() {
  addToast({
    title: "Centro de lucro salvo",
    color: "success",
  });
}

/** Toast de sucesso ao remover centro de lucro. */
export function showProfitCenterDeleteSuccessToast() {
  addToast({
    title: "Centro de lucro removido",
    color: "success",
  });
}

/** Toast de erro ao salvar centro de lucro. */
export function showProfitCenterSaveErrorToast(error: AxiosError<ErrorResponse>) {
  addToast({
    title: "Erro ao salvar",
    description: getErrorMessage(error, "Não foi possível salvar o centro de lucro."),
    color: "danger",
  });
}

/** Toast de erro ao remover centro de lucro. */
export function showProfitCenterDeleteErrorToast(error: AxiosError<ErrorResponse>) {
  addToast({
    title: "Erro ao remover",
    description: getErrorMessage(error, "Não foi possível remover o centro de lucro."),
    color: "danger",
  });
}
