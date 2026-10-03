import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useEffect, useState } from "react";
import type { ErrorResponse } from "@/shared/utils/errorParser";
import { getClients } from "../services/clientsMock.service";
import type { PaginatedClientsResponse } from "../types/clients.types";

const CLIENT_SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;

export function useClientSearch(searchTerm: string) {
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, CLIENT_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const normalizedSearch = debouncedSearch;
  const canSearch = normalizedSearch.length >= MIN_SEARCH_LENGTH;

  return useQuery<PaginatedClientsResponse, AxiosError<ErrorResponse>>({
    queryKey: ["clients", "search", normalizedSearch],
    queryFn: () =>
      getClients({
        search: normalizedSearch,
        page: 1,
        pageSize: 10,
      }),
    enabled: canSearch,
    placeholderData: keepPreviousData,
  });
}
