"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { updateProvider } from "../services/providers.service";
import type { ProviderDetail, UpdateProviderRequest } from "../types/providers.types";
import { invalidateProvidersListAndDetail } from "../utils/providersQueryInvalidation";

/**
 * Atualiza um provider e invalida lista + detalhe.
 */
export function useUpdateProvider() {
  const queryClient = useQueryClient();

  return useMutation<
    ProviderDetail,
    AxiosError<ErrorResponse>,
    { id: string; data: UpdateProviderRequest }
  >({
    mutationFn: ({ id, data }) => updateProvider(id, data),
    onSuccess: (_data, variables) => {
      invalidateProvidersListAndDetail(queryClient, variables.id);
    },
  });
}
