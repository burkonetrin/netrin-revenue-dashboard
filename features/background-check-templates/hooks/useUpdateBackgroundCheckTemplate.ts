/**
 * Hook de mutação para atualizar modelos de background check.
 */

import { type ErrorResponse, getErrorMessage } from "@/shared/utils/errorParser";
import { addToast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { updateBackgroundCheckTemplate } from "../services/background-check-templates.service";
import type {
  BackgroundCheckTemplate,
  UpdateBackgroundCheckTemplateRequest,
} from "../types/background-check-templates.types";
import { invalidateBackgroundCheckTemplatesList } from "../utils/backgroundCheckTemplatesQueryInvalidation";

/**
 * Persiste alterações do template e atualiza a listagem em cache.
 */
export function useUpdateBackgroundCheckTemplate() {
  const queryClient = useQueryClient();

  return useMutation<
    BackgroundCheckTemplate,
    AxiosError<ErrorResponse>,
    { id: string; data: UpdateBackgroundCheckTemplateRequest }
  >({
    mutationFn: ({ id, data }) => updateBackgroundCheckTemplate(id, data),
    onSuccess: () => {
      invalidateBackgroundCheckTemplatesList(queryClient);
      addToast({
        title: "Modelo atualizado com sucesso!",
        color: "success",
      });
    },
    onError: (error) => {
      addToast({
        title: "Erro ao atualizar modelo",
        description: getErrorMessage(error, "Tente novamente mais tarde."),
        color: "danger",
      });
    },
  });
}
