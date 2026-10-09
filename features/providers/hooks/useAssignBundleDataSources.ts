"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { assignBundleDataSources } from "../services/dataSourceBundles.service";
import type { AssignDataSourceIdsApiRequest } from "../types/data-source-bundles.types";

interface AssignBundleDataSourcesInput {
  id: string;
  data: AssignDataSourceIdsApiRequest;
}

/**
 * Hook de mutação para vincular fontes a um bundle.
 */
export function useAssignBundleDataSources() {
  return useMutation<number, AxiosError<ErrorResponse>, AssignBundleDataSourcesInput>({
    mutationFn: ({ id, data }) => assignBundleDataSources(id, data),
  });
}
