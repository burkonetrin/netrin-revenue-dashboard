import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getBillingDetail } from "../services/billing.service";
import type { BillingInvoiceDetail } from "../types/billing-detail.types";

/**
 * Parâmetros do hook de detalhe de faturamento.
 */
export interface UseBillingInvoiceDetailParams {
  id: string | undefined;
  source?: "invoice" | "entry";
  enabled?: boolean;
}

/**
 * Hook React Query para detalhe de fatura ou lançamento de faturamento.
 */
export function useBillingInvoiceDetail({
  id,
  source = "invoice",
  enabled = true,
}: UseBillingInvoiceDetailParams) {
  return useQuery<BillingInvoiceDetail, AxiosError<ErrorResponse>>({
    queryKey: ["billing", "detail", source, id],
    queryFn: () => getBillingDetail(id!, source),
    enabled: enabled && Boolean(id),
  });
}
