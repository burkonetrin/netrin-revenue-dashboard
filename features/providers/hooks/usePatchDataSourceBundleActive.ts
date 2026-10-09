"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/shared/utils/errorParser";
import {
  showPatchActiveErrorToast,
  showPatchActiveSuccessToast,
} from "@/shared/hooks/patchActiveStatusToasts";
import { patchDataSourceBundleActive } from "../services/dataSourceBundles.service";
import type {
  DataSourceBundle,
  PatchDataSourceBundleActiveRequest,
} from "../types/data-source-bundles.types";
import {
  invalidateDataSourceBundlesListAndDetail,
} from "../utils/providersQueryInvalidation";

interface PatchDataSourceBundleActiveInput {
  id: string;
  data: PatchDataSourceBundleActiveRequest;
}

/**
 * Hook de mutação para ativar ou desativar bundle de fontes.
 */
export function usePatchDataSourceBundleActive() {
  const queryClient = useQueryClient();

  return useMutation<
    DataSourceBundle,
    AxiosError<ErrorResponse>,
    PatchDataSourceBundleActiveInput
  >({
    mutationFn: ({ id, data }) => patchDataSourceBundleActive(id, data),
    onSuccess: (_, variables) => {
      invalidateDataSourceBundlesListAndDetail(queryClient, variables.id);
      showPatchActiveSuccessToast("grupo");
    },
    onError: () => {
      showPatchActiveErrorToast("grupo");
    },
  });
}
