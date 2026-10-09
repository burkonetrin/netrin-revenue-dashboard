"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { deleteProvider } from "../services/providers.service";
import { invalidateProvidersList } from "../utils/providersQueryInvalidation";

/**
 * Arquiva um provider e invalida a listagem (SUP-03).
 */
export function useDeleteProvider() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ErrorResponse>, string>({
    mutationFn: deleteProvider,
    onSuccess: () => {
      invalidateProvidersList(queryClient);
    },
  });
}
