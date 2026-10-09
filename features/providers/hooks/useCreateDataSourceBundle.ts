"use client";

import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/shared/utils/errorParser";
import { createDataSourceBundle } from "../services/dataSourceBundles.service";
import type {
  CreateDataSourceBundleApiRequest,
  DataSourceBundle,
} from "../types/data-source-bundles.types";

/**
 * Hook de mutação para criar bundle de fontes.
 */
export function useCreateDataSourceBundle() {
  return useMutation<
    DataSourceBundle,
    AxiosError<ErrorResponse>,
    CreateDataSourceBundleApiRequest
  >({ mutationFn: createDataSourceBundle });
}
