"use client";

import { useQuery } from "@tanstack/react-query";
import type { Product } from "../types/products.types";

const MOCK_SELLABLE_PRODUCTS: Product[] = [
  {
    id: "prod-bgc",
    name: "Background Check",
    internalName: "BGC",
    isActive: true,
  } as Product,
  {
    id: "prod-idv",
    name: "ID Validation",
    internalName: "IDV",
    isActive: true,
  } as Product,
];

export function useListSellableProducts(enabled = true) {
  return useQuery({
    queryKey: ["products", "sellable"],
    queryFn: async () => MOCK_SELLABLE_PRODUCTS,
    enabled,
  });
}
