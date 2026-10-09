"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToast } from "@heroui/react";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/shared/utils/errorParser";
import { patchDataSourceActive } from "../services/dataSources.service";
import type {
  DataSource,
  PatchDataSourceActiveRequest,
} from "../types/data-sources.types";
import { invalidateDataSourcesListAndDetail } from "../utils/providersQueryInvalidation";

interface PatchDataSourceActiveInput {
  id: string;
  data: PatchDataSourceActiveRequest;
}

/**
 * Hook de mutação para ativar ou desativar fonte de dados.
 */
export function usePatchDataSourceActive() {
  const queryClient = useQueryClient();

  return useMutation<
    DataSource,
    AxiosError<ErrorResponse>,
    PatchDataSourceActiveInput
  >({
    mutationFn: async ({ id, data }) => patchDataSourceActive(id, data),
    onSuccess: (_, variables) => {
      invalidateDataSourcesListAndDetail(queryClient, variables.id);
    },
    onError: () => {
      addToast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao tentar atualizar o status da fonte.",
        color: "danger",
      });
    },
  });
}
