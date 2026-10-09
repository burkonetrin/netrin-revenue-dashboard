"use client";

import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/shared/utils/errorParser";
import { updateDataSourceBundle } from "../services/dataSourceBundles.service";
import type {
  DataSourceBundle,
  UpdateDataSourceBundleApiRequest,
} from "../types/data-source-bundles.types";

interface UpdateDataSourceBundleInput {
  id: string;
  data: UpdateDataSourceBundleApiRequest;
}

/**
 * Hook de mutação para atualizar bundle de fontes.
 */
export function useUpdateDataSourceBundle() {
  return useMutation<
    DataSourceBundle,
    AxiosError<ErrorResponse>,
    UpdateDataSourceBundleInput
  >({
    mutationFn: ({ id, data }) => updateDataSourceBundle(id, data),
  });
}
