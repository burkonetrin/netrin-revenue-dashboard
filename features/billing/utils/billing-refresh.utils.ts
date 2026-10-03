import { addToast } from "@heroui/react";
import { isAxiosError } from "axios";
import { getErrorMessage } from "@/shared/utils/errorParser";

interface RefreshBillingConsumptionOptions {
  isPending: boolean;
  mutateAsync: () => Promise<unknown>;
  refetch: () => Promise<unknown>;
  setPage: (page: number) => void;
  /** Executado antes da mutação (ex.: limpar filtros na listagem global). */
  beforeRefresh?: () => void;
}

/**
 * Atualiza consumo de faturamento com toasts e reset de página/refetch.
 */
export async function refreshBillingConsumptionWithFeedback({
  isPending,
  mutateAsync,
  refetch,
  setPage,
  beforeRefresh,
}: RefreshBillingConsumptionOptions): Promise<void> {
  if (isPending) return;

  try {
    beforeRefresh?.();
    await mutateAsync();

    addToast({
      title: "Consumo atualizado",
      color: "success",
      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });
    setPage(1);
    await refetch();
  } catch (error) {
    addToast({
      title: getErrorMessage(
        isAxiosError(error) ? error : null,
        "Não foi possível atualizar o consumo",
      ),
      color: "danger",
      timeout: 4000,
      shouldShowTimeoutProgress: true,
    });
  }
}
