import type {
  ListProductsParams,
  PaginatedProductsResponse,
  Product,
} from "../types/products.types";

export interface ProductListItem {
  id: string;
  name: string;
  isActive: boolean;
}

const MOCK_SELLABLE: Product[] = [
  {
    id: "prod-bgc",
    name: "Background Check",
    internalName: "BGC",
    isActive: true,
    serviceTypes: [{ id: "st-bgc-1", name: "Padrão", internalName: "PADRAO" }],
  },
  {
    id: "prod-idv",
    name: "ID Validation",
    internalName: "IDV",
    isActive: true,
    serviceTypes: [
      { id: "st-idv-web", name: "Web", internalName: "WEB" },
      { id: "st-idv-api", name: "API", internalName: "API" },
    ],
  },
  {
    id: "prod-nucleus",
    name: "Consulta Netrin",
    internalName: "NUCLEUS",
    isActive: true,
    serviceTypes: [{ id: "st-nuc-1", name: "Consulta", internalName: "CONSULTA" }],
  },
  {
    id: "prod-api",
    name: "API",
    internalName: "API",
    isActive: true,
    serviceTypes: [{ id: "st-api-1", name: "API", internalName: "API" }],
  },
  {
    id: "prod-audicon",
    name: "Audicon",
    internalName: "AUDICON",
    isActive: true,
    serviceTypes: [{ id: "st-audicon-1", name: "Audicon", internalName: "AUDICON" }],
  },
  {
    id: "prod-enrichment",
    name: "Enriquecimento",
    internalName: "ENRICHMENT",
    isActive: true,
    serviceTypes: [{ id: "st-enrichment-1", name: "Enriquecimento", internalName: "ENRICHMENT" }],
  },
];

export async function getProducts(
  params?: ListProductsParams,
): Promise<PaginatedProductsResponse> {
  const pageSize = params?.pageSize ?? params?.limit ?? 20;
  const data = MOCK_SELLABLE.slice(0, pageSize);
  return {
    data,
    pagination: {
      hasNext: false,
      hasPrevious: false,
      page: params?.page ?? 1,
      pageSize,
      totalPages: 1,
      totalRecords: MOCK_SELLABLE.length,
    },
  };
}

export async function getSellableProducts(
  params?: ListProductsParams,
): Promise<PaginatedProductsResponse> {
  return getProducts(params);
}
