"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getSellableProducts } from "../services/products.service";
import type { ListProductsParams, PaginatedProductsResponse } from "../types/products.types";

export function useListSellableProducts(
  params?: ListProductsParams,
  options?: { enabled?: boolean },
) {
  return useQuery<PaginatedProductsResponse, AxiosError<ErrorResponse>>({
    queryKey: ["useListSellableProducts", params],
    queryFn: async () => getSellableProducts(params),
    enabled: options?.enabled ?? true,
    placeholderData: (previousData) => previousData,
  });
}