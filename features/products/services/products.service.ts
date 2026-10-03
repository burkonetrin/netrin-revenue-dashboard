import type { PaginationInfo } from "@/shared/types/pagination.types";

export interface ProductListItem {
  id: string;
  name: string;
  isActive: boolean;
}

export interface PaginatedProductsResponse {
  data: ProductListItem[];
  pagination: PaginationInfo;
}

export interface ListProductsParams {
  page?: number;
  pageSize?: number;
  limit?: number;
}

export async function getProducts(
  params?: ListProductsParams,
): Promise<PaginatedProductsResponse> {
  const data: ProductListItem[] = [
    { id: "prod-setup", name: "Setup / Projeto", isActive: true },
    { id: "prod-api", name: "API", isActive: true },
    { id: "prod-bgc", name: "BGC", isActive: true },
  ];

  return {
    data: data.slice(0, params?.pageSize ?? 20),
    pagination: {
      hasNext: false,
      hasPrevious: false,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
      totalPages: 1,
      totalRecords: data.length,
    },
  };
}
