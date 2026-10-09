/**
 * Hook de mutação para vincular fontes de dados a um modelo de background check.
 */

import { type ErrorResponse, getErrorMessage } from "@/shared/utils/errorParser";
import { addToast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { assignBackgroundCheckTemplateDataSources } from "../services/background-check-templates.service";
import type { AssignBackgroundCheckTemplateDataSourcesRequest } from "../types/background-check-templates.types";
import {
  invalidateBackgroundCheckTemplatesListAndDataSources,
} from "../utils/backgroundCheckTemplatesQueryInvalidation";

/**
 * Atribui fontes ao template e invalida listagens e vínculos em cache.
 */
export function useAssignBackgroundCheckTemplateDataSources() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ErrorResponse>,
    AssignBackgroundCheckTemplateDataSourcesRequest
  >({
    mutationFn: assignBackgroundCheckTemplateDataSources,
    onSuccess: (_, { templateId }) => {
      invalidateBackgroundCheckTemplatesListAndDataSources(queryClient, templateId);

      addToast({
        title: "Modelo salvo com sucesso!",
        color: "success",
      });
    },
    onError: (error) => {
      addToast({
        title: "Erro ao salvar modelo",
        description: getErrorMessage(error, "Tente novamente mais tarde."),
        color: "danger",
      });
    },
  });
}
