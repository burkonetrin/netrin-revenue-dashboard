/**
 * Hook de mutação para criar modelos de background check.
 */

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { createBackgroundCheckTemplate } from "../services/background-check-templates.service";
import type {
  BackgroundCheckTemplate,
  CreateBackgroundCheckTemplateRequest,
} from "../types/background-check-templates.types";
import { invalidateBackgroundCheckTemplatesList } from "../utils/backgroundCheckTemplatesQueryInvalidation";

/**
 * Cria um novo template e invalida a listagem de modelos.
 */
export function useCreateBackgroundCheckTemplate() {
  const queryClient = useQueryClient();

  return useMutation<
    BackgroundCheckTemplate,
    AxiosError<ErrorResponse>,
    CreateBackgroundCheckTemplateRequest
  >({
    mutationFn: createBackgroundCheckTemplate,
    onSuccess: () => {
      invalidateBackgroundCheckTemplatesList(queryClient);
    },
  });
}
