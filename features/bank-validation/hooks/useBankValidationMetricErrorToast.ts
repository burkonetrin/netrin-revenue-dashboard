import { type ErrorResponse, getErrorMessage } from "@/shared/utils/errorParser";
import { addToast } from "@heroui/react";
import type { AxiosError } from "axios";
import { useEffect, useRef } from "react";

/**
 * Exibe toast de erro deduplicado para tabelas de métricas de validação bancária.
 */
export function useBankValidationMetricErrorToast(
  referenceMonth: string,
  error: unknown,
  toastTitle: string,
  fallbackMessage: string,
) {
  const lastErrorToastRef = useRef<string | null>(null);

  const errorMessage = getErrorMessage(
    (error as AxiosError<ErrorResponse> | null) ?? null,
    fallbackMessage,
  );

  useEffect(() => {
    if (!errorMessage) {
      lastErrorToastRef.current = null;
      return;
    }

    const toastKey = `${referenceMonth}:${errorMessage}`;

    if (lastErrorToastRef.current === toastKey) {
      return;
    }

    lastErrorToastRef.current = toastKey;

    addToast({
      title: toastTitle,
      description: errorMessage,
      color: "danger",
    });
  }, [errorMessage, fallbackMessage, referenceMonth, toastTitle]);
}
