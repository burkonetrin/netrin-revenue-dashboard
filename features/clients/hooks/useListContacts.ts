"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getContactsByClient } from "../services/contactsMock.service";
import type { ListContactsParams, PaginatedContactsResponse } from "../types/contacts.types";

export function useListContacts(clientId: string | undefined, params?: ListContactsParams) {
  return useQuery<PaginatedContactsResponse, AxiosError<ErrorResponse>>({
    queryKey: ["clients", clientId, "contacts", params],
    queryFn: () => {
      if (!clientId) throw new Error("Client id is required");
      return getContactsByClient(clientId, params);
    },
    enabled: Boolean(clientId),
    placeholderData: (previousData) => previousData,
  });
}
