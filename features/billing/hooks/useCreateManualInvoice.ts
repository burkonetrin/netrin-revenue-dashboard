import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BillingManualInvoicePayload } from "../types/billing-manual-invoice.types";
import { createManualInvoice } from "../services/billing-manual-invoice.service";

export function useCreateManualInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BillingManualInvoicePayload) => createManualInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
}
