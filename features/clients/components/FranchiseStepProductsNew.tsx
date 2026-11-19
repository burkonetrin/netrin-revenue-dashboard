"use client";

import { filterVisibleProducts } from "@/features/permissions-rbac/constants/rbacProducts.constants";
import { useListSellableProducts } from "@/features/products/hooks/useListSellableProducts";
import type { Product, ProductServiceType } from "@/features/products/types/products.types";
import { defaultInputClassNames, defaultSelectClassNames } from "@/shared/styles/inputClassNames";
import { Checkbox, Input, Select, SelectItem } from "@heroui/react";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CreateDeductibleRequest } from "../types/deductibles.types";

interface FranchiseStepProductsNewProps {
  state: CreateDeductibleRequest;
  onStateChange: (next: Partial<CreateDeductibleRequest>) => void;
  canListProducts?: boolean;
}

/**
 * Passo de produtos na nova franquia.
 */
export function FranchiseStepProductsNew({
  state,
  onStateChange,
  canListProducts = true,
}: FranchiseStepProductsNewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const selectedProductIds = useMemo(
    () => state.productIds.map((product) => product.productId),
    [state.productIds],
  );
  const { data: productsData, isLoading } = useListSellableProducts(
    {
      page: 1,
      pageSize: 100,
      sortBy: "name",
      sortDirection: "asc",
    },
    { enabled: canListProducts },
  );

  const products = filterVisibleProducts(canListProducts ? (productsData?.data ?? []) : []);

  const filteredProducts = useMemo(
    () => products.filter((p: Product) => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, products],
  );

  const serviceTypesByProductId = useMemo(() => {
    const serviceTypes = new Map<string, ProductServiceType[]>();

    for (const product of products) {
      serviceTypes.set(product.id, product.serviceTypes ?? []);
    }

    return serviceTypes;
  }, [products]);

  const toggleProduct = (prodId: string, isSelected: boolean) => {
    if (isSelected) {
      onStateChange({
        productIds: [...state.productIds, { productId: prodId, serviceTypeId: "" }],
      });
      return;
    }

    onStateChange({
      productIds: state.productIds.filter((product) => product.productId !== prodId),
    });
  };

  const updateProductServiceType = (productId: string, serviceTypeId: string) => {
    onStateChange({
      productIds: state.productIds.map((product) => {
        return product.productId === productId ? { ...product, serviceTypeId } : product;
      }),
    });
  };

  const getProductServiceTypes = (product: Product): ProductServiceType[] => {
    return serviceTypesByProductId.get(product.id) ?? [];
  };

  const getServiceTypeLabel = (serviceType: ProductServiceType) => {
    const internalName = serviceType.internalName ?? serviceType.internal_name;

    return internalName && internalName !== serviceType.name
      ? `${serviceType.name} (${internalName})`
      : serviceType.name;
  };

  const getSelectedProduct = (productId: string) => {
    return state.productIds.find((product) => product.productId === productId);
  };

  useEffect(() => {
    const nextProductIds = state.productIds.map((selectedProduct) => {
      if (selectedProduct.serviceTypeId) return selectedProduct;

      const serviceTypes = serviceTypesByProductId.get(selectedProduct.productId) ?? [];

      if (serviceTypes.length !== 1) return selectedProduct;

      return {
        ...selectedProduct,
        serviceTypeId: serviceTypes[0].id,
      };
    });

    const hasAutoSelectedServiceType = nextProductIds.some(
      (product, index) => product.serviceTypeId !== state.productIds[index]?.serviceTypeId,
    );

    if (hasAutoSelectedServiceType) {
      onStateChange({ productIds: nextProductIds });
    }
  }, [state.productIds, serviceTypesByProductId, onStateChange]);

  const allSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p: Product) => selectedProductIds.includes(p.id));

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-default-500">Produtos</h3>

      {!canListProducts ? (
        <p className="text-sm text-default-500">Você não possui permissão para listar produtos.</p>
      ) : null}

      <Input
        placeholder="Pesquise por produto"
        value={searchTerm}
        onValueChange={setSearchTerm}
        endContent={<Search size={18} className="text-default-400" />}
        classNames={defaultInputClassNames}
        isDisabled={!canListProducts}
      />

      <div className="flex flex-col gap-3">
        <Checkbox
          isDisabled={!canListProducts}
          isSelected={allSelected}
          onValueChange={(selected) => {
            onStateChange({
              productIds: selected
                ? [
                    ...state.productIds,
                    ...filteredProducts
                      .filter((product) => !selectedProductIds.includes(product.id))
                      .map((product) => ({ productId: product.id, serviceTypeId: "" })),
                  ]
                : state.productIds.filter(
                    (product) =>
                      !filteredProducts.some(
                        (filteredProduct) => filteredProduct.id === product.productId,
                      ),
                  ),
            });
          }}
        >
          Selecionar todos os resultados
        </Checkbox>
      </div>

      <div className="border border-default-200 rounded-lg">
        {isLoading ? (
          <p className="p-4 text-center text-default-400 text-sm italic">Carregando produtos...</p>
        ) : (
          filteredProducts.map((product: Product) => (
            <div
              key={product.id}
              className="min-h-12 px-3 py-2 border-b border-default-200 last:border-b-0 grid grid-cols-1 gap-2 hover:bg-default-50 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  isSelected={selectedProductIds.includes(product.id)}
                  onValueChange={(selected) => toggleProduct(product.id, selected)}
                />
                <span className="text-sm">{product.name}</span>
              </div>
              {selectedProductIds.includes(product.id) && (
                <div>
                  <Select
                    aria-label={`Tipo de serviço de ${product.name}`}
                    placeholder="Tipo de serviço"
                    size="sm"
                    selectedKeys={
                      getSelectedProduct(product.id)?.serviceTypeId
                        ? new Set([getSelectedProduct(product.id)?.serviceTypeId ?? ""])
                        : new Set()
                    }
                    onSelectionChange={(keys) => {
                      const [serviceTypeId] = Array.from(keys);
                      updateProductServiceType(
                        product.id,
                        serviceTypeId ? String(serviceTypeId) : "",
                      );
                    }}
                    classNames={defaultSelectClassNames}
                  >
                    {getProductServiceTypes(product).map((serviceType) => (
                      <SelectItem key={serviceType.id} textValue={getServiceTypeLabel(serviceType)}>
                        <span
                          className="block max-w-full truncate"
                          title={getServiceTypeLabel(serviceType)}
                        >
                          {getServiceTypeLabel(serviceType)}
                        </span>
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              )}
            </div>
          ))
        )}
        {!isLoading && filteredProducts.length === 0 && (
          <p className="p-4 text-center text-default-400 text-sm">Nenhum produto encontrado</p>
        )}
      </div>
    </div>
  );
}
