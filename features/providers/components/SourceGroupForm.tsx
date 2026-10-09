"use client";

/**
 * Formulário de cadastro e edição de grupos de fontes (bundles).
 */

import { filterVisibleProducts } from "@/features/permissions-rbac/constants/rbacProducts.constants";
import { useListProducts } from "@/features/products/hooks/useListProducts";
import { defaultInputClassNames, defaultSelectClassNames } from "@/shared/styles/inputClassNames";
import { Checkbox, Input, Select, SelectItem, Spinner } from "@heroui/react";
import { SourceGroupSourcesStep } from "./SourceGroupSourcesStep";
import type { SourceGroupFormData } from "../types/data-source-bundles.types";

export type SourceGroupFormStep = 1 | 2;

interface SourceGroupFormProps {
  step: SourceGroupFormStep;
  formData: SourceGroupFormData;
  onFormDataChange: (data: SourceGroupFormData) => void;
  isLoading?: boolean;
  isEditMode?: boolean;
  onActiveChange?: (isActive: boolean) => void | Promise<void>;
  isPatchingActive?: boolean;
  showNameError?: boolean;
  showProductError?: boolean;
  showSourceError?: boolean;
}

/**
 * Formulário de grupo de fontes (bundle).
 */
export function SourceGroupForm({
  step,
  formData,
  onFormDataChange,
  isLoading = false,
  isEditMode = false,
  onActiveChange,
  isPatchingActive = false,
  showNameError = false,
  showProductError = false,
  showSourceError = false,
}: SourceGroupFormProps) {
  const { data: productsResponse, isLoading: isProductsLoading } = useListProducts({
    page: 1,
    limit: 100,
  });
  const products = filterVisibleProducts(productsResponse?.data ?? []);

  const update = (partial: Partial<SourceGroupFormData>) => {
    onFormDataChange({ ...formData, ...partial });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (step === 2) {
    return (
      <SourceGroupSourcesStep
        selectedSources={formData.selectedSources}
        onSelectedSourcesChange={(selectedSources) =>
          onFormDataChange({ ...formData, selectedSources })
        }
        showSourceError={showSourceError}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      <Checkbox
        isSelected={formData.isActive}
        onValueChange={(isActive) => {
          if (isEditMode && onActiveChange) {
            void onActiveChange(isActive);
            return;
          }
          update({ isActive });
        }}
        isDisabled={isPatchingActive}
        classNames={{ label: "text-sm font-medium text-zinc-500" }}
      >
        Ativo
      </Checkbox>

      <div className="flex flex-col gap-2">
        <label htmlFor="source-group-name" className="text-sm text-zinc-500">
          Nome do grupo<span className="text-danger"> *</span>
        </label>
        <Input
          id="source-group-name"
          placeholder="Ex.: Fontes Background Check"
          value={formData.name}
          onValueChange={(name) => update({ name })}
          isInvalid={showNameError && !formData.name.trim()}
          errorMessage="Campo obrigatório"
          classNames={defaultInputClassNames}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="source-group-products" className="text-sm text-zinc-500">
          Produtos do grupo<span className="text-danger"> *</span>
        </label>
        <Select
          id="source-group-products"
          aria-label="Produtos do grupo"
          placeholder="Selecione um ou mais produtos"
          selectionMode="multiple"
          selectedKeys={new Set(formData.productIds)}
          onSelectionChange={(keys) => update({ productIds: Array.from(keys).map(String) })}
          classNames={defaultSelectClassNames}
          isLoading={isProductsLoading}
          isInvalid={showProductError && formData.productIds.length === 0}
          errorMessage="Campo obrigatório"
          items={products}
        >
          {(product) => <SelectItem key={product.id}>{product.name}</SelectItem>}
        </Select>
      </div>

      {showSourceError && <p className="text-tiny text-danger">Campo obrigatório</p>}
    </div>
  );
}
