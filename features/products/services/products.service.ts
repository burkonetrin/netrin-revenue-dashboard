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
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
}

export async function getProducts(
  params?: ListProductsParams,
): Promise<PaginatedProductsResponse> {
  const data: ProductListItem[] = [
    { id: "0195694a-939a-7c9c-b169-2f22b8264779", name: "Nucleus", isActive: true },
    { id: "prod-api", name: "API", isActive: true },
    { id: "prod-bgc", name: "BGC", isActive: true },
    { id: "0195694a-939a-7c9c-b169-2f22b8264770", name: "SafePartner", isActive: true },
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
