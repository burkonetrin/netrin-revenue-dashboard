"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getBankValidationTransactionQuality } from "../services/bankValidation.service";
import type {
  BankValidationTransactionQualityParams,
  BankValidationTransactionQualityResponse,
} from "../types/bank-validation.types";

export function useBankValidationTransactionQuality({
  referenceMonth,
}: BankValidationTransactionQualityParams) {
  return useQuery<BankValidationTransactionQualityResponse, AxiosError<ErrorResponse>>({
    queryKey: ["bank-validation", "transaction-quality", referenceMonth],
    queryFn: () => getBankValidationTransactionQuality({ referenceMonth }),
    enabled: Boolean(referenceMonth),
    placeholderData: (previousData) => previousData,
  });
}
