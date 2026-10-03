import type { ErrorResponse } from "@/shared/utils/errorParser";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getProducts } from "../services/products.service";
import type { ListProductsParams, PaginatedProductsResponse } from "../types/products.types";

export function useListProducts(params?: ListProductsParams, options?: { enabled?: boolean }) {
  return useQuery<PaginatedProductsResponse, AxiosError<ErrorResponse>>({
    queryKey: ["useListProducts", params],
    queryFn: async () => getProducts(params),
    enabled: options?.enabled ?? true,
    placeholderData: (previousData) => previousData,
  });
}
