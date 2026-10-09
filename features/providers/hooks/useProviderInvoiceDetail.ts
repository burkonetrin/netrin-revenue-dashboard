"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getProviderInvoiceSnapshot } from "../services/providerInvoices.service";
import type { ProviderInvoiceResponse } from "../types/providerInvoices.types";

export function providerInvoiceDetailQueryKey(invoiceId: string) {
  return ["providers", "invoice-detail", invoiceId] as const;
}

/** Consulta o snapshot salvo da fatura sem recalcular seus valores. */
export function useProviderInvoiceDetail(invoiceId?: string) {
  return useQuery<ProviderInvoiceResponse, AxiosError<ErrorResponse>>({
    queryKey: providerInvoiceDetailQueryKey(invoiceId ?? ""),
    queryFn: () => getProviderInvoiceSnapshot(invoiceId ?? ""),
    enabled: Boolean(invoiceId),
  });
}
