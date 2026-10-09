/**
 * Hook de mutação para associar modelos de background check a uma franquia.
 */

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { assignBackgroundCheckTemplateToDeductible } from "../services/background-check-templates.service";
import type { AssignBackgroundCheckTemplateToDeductibleRequest } from "../types/background-check-templates.types";
import { invalidateDeductibleBackgroundCheckTemplates } from "../utils/backgroundCheckTemplatesQueryInvalidation";

/**
 * Vincula templates à franquia e atualiza a consulta de modelos do deductible.
 */
export function useAssignBackgroundCheckTemplateToDeductible() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ErrorResponse>,
    AssignBackgroundCheckTemplateToDeductibleRequest
  >({
    mutationFn: assignBackgroundCheckTemplateToDeductible,
    onSuccess: (_, variables) => {
      invalidateDeductibleBackgroundCheckTemplates(queryClient, variables.deductibleId);
    },
  });
}
