"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  listBillableInvoiceSources,
  type ProviderInvoiceBillableSourcesQuery,
} from "../services/providerInvoices.service";
import type { ProviderInvoiceBillableSourceResponse } from "../types/providerInvoices.types";

export interface ProviderInvoiceBillableSourcesParams {
  assessmentStartDate?: string | null;
  assessmentEndDate?: string | null;
}

export function providerInvoiceBillableSourcesQueryKey(
  providerId: string,
  assessmentStartDate?: string | null,
  assessmentEndDate?: string | null,
) {
  return [
    "providers",
    "invoices",
    "billable-sources",
    providerId,
    assessmentStartDate ?? null,
    assessmentEndDate ?? null,
  ] as const;
}

function isValidIsoDate(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function useProviderInvoiceBillableSources(
  providerId?: string,
  params: ProviderInvoiceBillableSourcesParams = {},
  options?: { enabled?: boolean },
) {
  const { assessmentStartDate, assessmentEndDate } = params;
  const datesAreValid = isValidIsoDate(assessmentStartDate) && isValidIsoDate(assessmentEndDate);
  const enabled = Boolean(providerId) && datesAreValid && (options?.enabled ?? true);

  return useQuery<ProviderInvoiceBillableSourceResponse[], AxiosError<ErrorResponse>>({
    queryKey: providerInvoiceBillableSourcesQueryKey(
      providerId ?? "",
      assessmentStartDate,
      assessmentEndDate,
    ),
    queryFn: () =>
      listBillableInvoiceSources(providerId ?? "", {
        assessmentStartDate: assessmentStartDate as string,
        assessmentEndDate: assessmentEndDate as string,
      } satisfies ProviderInvoiceBillableSourcesQuery),
    enabled,
  });
}
