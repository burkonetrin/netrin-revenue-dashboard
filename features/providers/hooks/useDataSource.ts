"use client";

import { useQuery } from "@tanstack/react-query";
import { getDataSourceById } from "../services/dataSources.service";
import type { DataSource } from "../types/data-sources.types";

/**
 * Hook React Query para buscar fonte de dados por ID.
 * @param id - Identificador do recurso
 */
export function useDataSource(id: string | null) {
  return useQuery<DataSource>({
    queryKey: ["data-sources", id],
    queryFn: () => {
      if (!id) {
        throw new Error("Data source id is required");
      }
      return getDataSourceById(id);
    },
    enabled: Boolean(id),
  });
}
