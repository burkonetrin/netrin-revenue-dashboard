"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToast } from "@heroui/react";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/shared/utils/errorParser";
import { deleteDataSourceBundle } from "../services/dataSourceBundles.service";
import { invalidateDataSourceBundlesList } from "../utils/providersQueryInvalidation";

/**
 * Hook de mutação para excluir bundle de fontes.
 */
export function useDeleteDataSourceBundle() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ErrorResponse>, string>({
    mutationFn: deleteDataSourceBundle,
    onSuccess: () => {
      invalidateDataSourceBundlesList(queryClient);
      addToast({
        title: "Grupo excluído",
        description: "O grupo de fontes foi excluído com sucesso.",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Erro ao excluir grupo",
        description: "Ocorreu um erro ao tentar excluir o grupo de fontes.",
        color: "danger",
      });
    },
  });
}
