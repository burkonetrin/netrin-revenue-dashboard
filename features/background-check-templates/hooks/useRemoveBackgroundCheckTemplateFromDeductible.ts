/**
 * Hook de mutação para desvincular modelos de background check de uma franquia.
 */

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { removeBackgroundCheckTemplateFromDeductible } from "../services/background-check-templates.service";
import type { AssignBackgroundCheckTemplateToDeductibleRequest } from "../types/background-check-templates.types";
import { invalidateDeductibleBackgroundCheckTemplates } from "../utils/backgroundCheckTemplatesQueryInvalidation";

/**
 * Remove templates da franquia e invalida a consulta de vínculos.
 */
export function useRemoveBackgroundCheckTemplateFromDeductible() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ErrorResponse>,
    AssignBackgroundCheckTemplateToDeductibleRequest
  >({
    mutationFn: removeBackgroundCheckTemplateFromDeductible,
    onSuccess: (_, variables) => {
      invalidateDeductibleBackgroundCheckTemplates(queryClient, variables.deductibleId);
    },
  });
}
