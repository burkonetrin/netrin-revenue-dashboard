"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getBankValidationVolumetry } from "../services/bankValidation.service";
import type {
  BankValidationVolumetryParams,
  BankValidationVolumetryResponse,
} from "../types/bank-validation.types";

export function useBankValidationVolume({ referenceMonth }: BankValidationVolumetryParams) {
  return useQuery<BankValidationVolumetryResponse, AxiosError<ErrorResponse>>({
    queryKey: ["bank-validation", "volumetry", referenceMonth],
    queryFn: () => getBankValidationVolumetry({ referenceMonth }),
    enabled: Boolean(referenceMonth),
    placeholderData: (previousData) => previousData,
  });
}
