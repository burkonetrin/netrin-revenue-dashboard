"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/shared/utils/errorParser";
import { removeBundleDataSources } from "../services/dataSourceBundles.service";
import type { RemoveDataSourceIdsRequest } from "../types/data-source-bundles.types";
import { invalidateDataSourceBundlesListAndDetail } from "../utils/providersQueryInvalidation";

interface RemoveBundleDataSourcesInput {
  id: string;
  data: RemoveDataSourceIdsRequest;
}

/**
 * Hook de mutação para remover fontes de um bundle.
 */
export function useRemoveBundleDataSources() {
  const queryClient = useQueryClient();

  return useMutation<number, AxiosError<ErrorResponse>, RemoveBundleDataSourcesInput>(
    {
      mutationFn: ({ id, data }) => removeBundleDataSources(id, data),
      onSuccess: (_, variables) => {
        invalidateDataSourceBundlesListAndDetail(queryClient, variables.id);
      },
    },
  );
}
