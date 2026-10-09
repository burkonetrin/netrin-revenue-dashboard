"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { createProvider } from "../services/providers.service";
import type { CreateProviderRequest, ProviderDetail } from "../types/providers.types";
import { invalidateProvidersList } from "../utils/providersQueryInvalidation";

/**
 * Cria um provider e invalida a listagem.
 */
export function useCreateProvider() {
  const queryClient = useQueryClient();

  return useMutation<ProviderDetail, AxiosError<ErrorResponse>, CreateProviderRequest>({
    mutationFn: createProvider,
    onSuccess: () => {
      invalidateProvidersList(queryClient);
    },
  });
}
