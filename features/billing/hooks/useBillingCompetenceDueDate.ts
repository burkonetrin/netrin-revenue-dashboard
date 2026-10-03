"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getBillingList } from "../services/billing.service";
import type { BillingInvoiceScope } from "../types/billing.types";
import {
  findBillingRecordForCompetence,
  resolveUnifiedBillingDueDate,
} from "../utils/billing-manual-invoice.utils";

interface UseBillingCompetenceDueDateParams {
  clientId: string | undefined;
  competence: string | undefined;
  scope: BillingInvoiceScope | null;
  contractId?: string;
  enabled?: boolean;
}

/**
 * Busca o dueDate já calculado na entry/invoice da competência (mesma nota).
 */
export function useBillingCompetenceDueDate({
  clientId,
  competence,
  scope,
  contractId,
  enabled = true,
}: UseBillingCompetenceDueDateParams) {
  const competenceKey = competence?.slice(0, 7);
  const queryEnabled = Boolean(enabled && clientId && competenceKey && scope);

  return useQuery<string | undefined, AxiosError<ErrorResponse>>({
    queryKey: [
      "billing",
      "competence-due-date",
      clientId,
      competenceKey,
      scope,
      contractId ?? null,
    ],
    queryFn: async () => {
      if (!clientId || !competenceKey || !scope) return undefined;

      const response = await getBillingList(
        {
          clientId,
          startMonth: competenceKey,
          endMonth: competenceKey,
        },
        1,
        50,
      );

      const record = findBillingRecordForCompetence(response.data, clientId, competenceKey);
      return resolveUnifiedBillingDueDate(record, { scope, contractId });
    },
    enabled: queryEnabled,
  });
}
