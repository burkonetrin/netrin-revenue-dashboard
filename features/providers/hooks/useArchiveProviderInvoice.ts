"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { archiveProviderInvoice } from "../services/providerInvoices.service";
import type { ProviderInvoiceResponse } from "../types/providerInvoices.types";
import { invalidateProviderDetail } from "../utils/providersQueryInvalidation";

/** Arquiva uma fatura pós-paga e atualiza as consultas do fornecedor. */
export function useArchiveProviderInvoice(providerId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProviderInvoiceResponse, AxiosError<ErrorResponse>, string>({
    mutationFn: archiveProviderInvoice,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["providers", "invoices", providerId] });
      invalidateProviderDetail(queryClient, providerId);
    },
  });
}
