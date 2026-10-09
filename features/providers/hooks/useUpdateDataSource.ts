"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToast } from "@heroui/react";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/shared/utils/errorParser";
import { updateDataSource } from "../services/dataSources.service";
import type {
  DataSource,
  UpdateDataSourceRequest,
} from "../types/data-sources.types";
import { invalidateDataSourcesListAndDetail } from "../utils/providersQueryInvalidation";

interface UpdateDataSourceInput {
  id: string;
  data: UpdateDataSourceRequest;
}

/**
 * Hook de mutação para atualizar fonte de dados.
 */
export function useUpdateDataSource() {
  const queryClient = useQueryClient();

  return useMutation<DataSource, AxiosError<ErrorResponse>, UpdateDataSourceInput>({
    mutationFn: async ({ id, data }) => updateDataSource(id, data),
    onSuccess: (_, variables) => {
      invalidateDataSourcesListAndDetail(queryClient, variables.id);
      addToast({
        title: "Fonte atualizada",
        description: "A fonte de dados foi atualizada com sucesso.",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao tentar atualizar a fonte de dados.",
        color: "danger",
      });
    },
  });
}
