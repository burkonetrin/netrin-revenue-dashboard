import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runBillingAssessment } from "../services/billing.service";
import { getCurrentYearMonth } from "../utils/billing-month.utils";

/**
 * Hook de mutação para atualizar consumo de faturamento.
 */
export function useRefreshBillingConsumption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { year, month } = getCurrentYearMonth();
      await runBillingAssessment(year, month);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
}
