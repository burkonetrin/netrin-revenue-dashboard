import type { PaginationInfo } from "@/shared/types/pagination.types";

export interface ProductServiceType {
  id: string;
  name: string;
  internalName?: string;
  internal_name?: string;
}

export interface Product {
  id: string;
  name: string;
  internalName?: string;
  description?: string;
  serviceTypes?: ProductServiceType[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  pageSize?: number;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
  search?: string | null;
}

export interface PaginatedProductsResponse {
  data: Product[];
  pagination: PaginationInfo;
}

export type { ProductListItem } from "../services/products.service";