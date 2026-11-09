"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { resolveClientForFranchiseDetail } from "../services/clientsMock.service";
import type { Client } from "../types/clients.types";

export function useClientById(clientId: string | undefined) {
  return useQuery<Client, AxiosError<ErrorResponse>>({
    queryKey: ["clients", "detail", clientId],
    queryFn: async () => {
      if (!clientId) throw new Error("clientId is required");
      return resolveClientForFranchiseDetail(clientId);
    },
    enabled: Boolean(clientId),
  });
}
