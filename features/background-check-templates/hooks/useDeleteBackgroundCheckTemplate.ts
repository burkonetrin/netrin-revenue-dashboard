/**
 * Hook de mutação para remover modelos de background check.
 */

import { type ErrorResponse, getErrorMessage } from "@/shared/utils/errorParser";
import { addToast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { deleteBackgroundCheckTemplate } from "../services/background-check-templates.service";
import { invalidateBackgroundCheckTemplatesList } from "../utils/backgroundCheckTemplatesQueryInvalidation";

/**
 * Exclui o template informado e atualiza a listagem em cache.
 */
export function useDeleteBackgroundCheckTemplate() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ErrorResponse>, string>({
    mutationFn: deleteBackgroundCheckTemplate,
    onSuccess: () => {
      invalidateBackgroundCheckTemplatesList(queryClient);
      addToast({
        title: "Modelo removido com sucesso!",
        color: "success",
      });
    },
    onError: (error) => {
      addToast({
        title: "Erro ao remover modelo",
        description: getErrorMessage(error, "Tente novamente mais tarde."),
        color: "danger",
      });
    },
  });
}
