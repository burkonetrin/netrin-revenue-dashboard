"use client";

import { filterVisibleProducts } from "@/features/permissions-rbac/constants/rbacProducts.constants";
import { useListSellableProducts } from "@/features/products/hooks/useListSellableProducts";
import type { Product, ProductServiceType } from "@/features/products/types/products.types";
import { defaultCheckboxClassNames, defaultSelectClassNames } from "@/shared/styles/inputClassNames";
import { Checkbox, Select, SelectItem } from "@heroui/react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import type { CreateDeductibleRequest } from "../types/deductibles.types";
import {
  FRANCHISE_COMBO_CHECKBOX_LABELS,
  FRANCHISE_COMBO_MEMBER_PRODUCT_IDS,
  FRANCHISE_COMBO_PRODUCT_ID,
  FRANCHISE_COMBO_PRODUCT_LABEL,
  getFranchiseComboMemberRows,
  resolveFranchiseMainProductId,
  type FranchiseComboCheckboxLabel,
} from "../utils/franchiseBasicProductSelection.utils";

const REQUIRED_MESSAGE = "Campo obrigatório";
const COMBO_REQUIRED_MESSAGE = "Selecione ao menos um produto";
const MAX_COMBO_SELECTIONS = 3;
const PRODUCT_LABEL = "Produto da franquia";
const SERVICE_TYPE_LABEL = "Tipo de serviço";

export interface FranchiseBasicProductFieldsHandle {
  validate: () => boolean;
}

interface FranchiseBasicProductFieldsProps {
  state: CreateDeductibleRequest;
  onStateChange: (next: Partial<CreateDeductibleRequest>) => void;
  canListProducts?: boolean;
  getSelectClassNames: (isError: boolean) => typeof defaultSelectClassNames;
}

function getServiceTypeLabel(serviceType: ProductServiceType) {
  const internalName = serviceType.internalName ?? serviceType.internal_name;
  return internalName && internalName !== serviceType.name
    ? `${serviceType.name} (${internalName})`
    : serviceType.name;
}

export const FranchiseBasicProductFields = forwardRef<
  FranchiseBasicProductFieldsHandle,
  FranchiseBasicProductFieldsProps
>(function FranchiseBasicProductFields(
  { state, onStateChange, canListProducts = true, getSelectClassNames },
  ref,
) {
  const [showErrors, setShowErrors] = useState(false);

  const { data: productsData, isLoading } = useListSellableProducts(
    {
      page: 1,
      pageSize: 100,
      sortBy: "name",
      sortDirection: "asc",
    },
    { enabled: canListProducts },
  );

  const sellableProducts = useMemo(() => {
    const rows = filterVisibleProducts(canListProducts ? (productsData?.data ?? []) : []);
    const hasCombo = rows.some((product) => product.id === FRANCHISE_COMBO_PRODUCT_ID);
    if (hasCombo) return rows;

    return [
      ...rows,
      {
        id: FRANCHISE_COMBO_PRODUCT_ID,
        name: FRANCHISE_COMBO_PRODUCT_LABEL,
        isActive: true,
        serviceTypes: [],
      } satisfies Product,
    ];
  }, [canListProducts, productsData?.data]);

  const serviceTypesByProductId = useMemo(() => {
    const map = new Map<string, ProductServiceType[]>();
    for (const product of sellableProducts) {
      if (product.id === FRANCHISE_COMBO_PRODUCT_ID) continue;
      map.set(product.id, product.serviceTypes ?? []);
    }
    for (const label of FRANCHISE_COMBO_CHECKBOX_LABELS) {
      const productId = FRANCHISE_COMBO_MEMBER_PRODUCT_IDS[label];
      const product = sellableProducts.find((row) => row.id === productId);
      map.set(productId, product?.serviceTypes ?? [{ id: `st-${productId}`, name: "Padrão" }]);
    }
    return map;
  }, [sellableProducts]);

  const mainProductId = resolveFranchiseMainProductId(state.productIds);
  const isCombo = mainProductId === FRANCHISE_COMBO_PRODUCT_ID;
  const selectedProduct = sellableProducts.find((product) => product.id === mainProductId);
  const serviceTypes = selectedProduct?.serviceTypes ?? [];
  const showServiceTypeSelect = Boolean(mainProductId) && !isCombo && serviceTypes.length > 1;
  const selectedServiceTypeId = state.productIds[0]?.serviceTypeId ?? "";

  const comboMemberRows = useMemo(
    () => getFranchiseComboMemberRows(state.productIds),
    [state.productIds],
  );

  const comboSelectedLabels = useMemo(() => {
    if (!isCombo) return [];
    const reverse = new Map(
      Object.entries(FRANCHISE_COMBO_MEMBER_PRODUCT_IDS).map(([label, id]) => [id, label]),
    );
    return comboMemberRows
      .map((row) => reverse.get(row.productId))
      .filter((label): label is FranchiseComboCheckboxLabel => Boolean(label));
  }, [comboMemberRows, isCombo]);

  useEffect(() => {
    if (isCombo || state.productIds.length !== 1) return;
    const only = state.productIds[0];
    if (only.serviceTypeId) return;

    const types = serviceTypesByProductId.get(only.productId) ?? [];
    if (types.length !== 1) return;

    onStateChange({
      productIds: [{ productId: only.productId, serviceTypeId: types[0].id }],
    });
  }, [isCombo, onStateChange, serviceTypesByProductId, state.productIds]);

  const productError = showErrors && !mainProductId ? REQUIRED_MESSAGE : undefined;
  const serviceTypeError =
    showErrors && showServiceTypeSelect && !selectedServiceTypeId ? REQUIRED_MESSAGE : undefined;
  const comboError =
    showErrors && isCombo && comboMemberRows.length === 0 ? COMBO_REQUIRED_MESSAGE : undefined;

  useImperativeHandle(ref, () => ({
    validate: () => {
      setShowErrors(true);
      if (!canListProducts) return true;
      if (!mainProductId) return false;
      if (isCombo) return comboMemberRows.length > 0;
      if (showServiceTypeSelect) return Boolean(selectedServiceTypeId);
      return state.productIds.length === 1 && Boolean(state.productIds[0]?.serviceTypeId);
    },
  }));

  const setMainProduct = (productId: string) => {
    if (productId === FRANCHISE_COMBO_PRODUCT_ID) {
      onStateChange({
        productIds: [{ productId: FRANCHISE_COMBO_PRODUCT_ID, serviceTypeId: "" }],
      });
      return;
    }

    const types = serviceTypesByProductId.get(productId) ?? [];
    const serviceTypeId = types.length === 1 ? types[0].id : "";
    onStateChange({ productIds: [{ productId, serviceTypeId }] });
  };

  const setServiceType = (serviceTypeId: string) => {
    const productId = state.productIds[0]?.productId;
    if (!productId) return;
    onStateChange({ productIds: [{ productId, serviceTypeId }] });
  };

  const toggleComboCheckbox = (label: FranchiseComboCheckboxLabel, checked: boolean) => {
    const productId = FRANCHISE_COMBO_MEMBER_PRODUCT_IDS[label];
    const types = serviceTypesByProductId.get(productId) ?? [];
    const serviceTypeId = types[0]?.id ?? `st-${productId}`;
    const anchor = { productId: FRANCHISE_COMBO_PRODUCT_ID, serviceTypeId: "" };
    const members = comboMemberRows;

    if (checked) {
      if (members.length >= MAX_COMBO_SELECTIONS) return;
      if (members.some((row) => row.productId === productId)) return;
      onStateChange({
        productIds: [anchor, ...members, { productId, serviceTypeId }],
      });
      return;
    }

    const nextMembers = members.filter((row) => row.productId !== productId);
    onStateChange({
      productIds: [anchor, ...nextMembers],
    });
  };

  if (!canListProducts) {
    return (
      <p className="text-sm text-default-500">Você não possui permissão para listar produtos.</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-default-500">
          {PRODUCT_LABEL} <span className="text-danger">*</span>
        </p>
        <Select
          aria-label={PRODUCT_LABEL}
          placeholder="Selecione uma opção"
          selectedKeys={mainProductId ? [mainProductId] : []}
          onSelectionChange={(keys) => {
            const productId = String(Array.from(keys)[0] ?? "");
            if (productId) setMainProduct(productId);
          }}
          isInvalid={Boolean(productError)}
          errorMessage={productError}
          isLoading={isLoading}
          isDisabled={isLoading}
          classNames={{ ...getSelectClassNames(Boolean(productError)), base: "w-full" }}
        >
          {sellableProducts.map((product) => (
            <SelectItem key={product.id}>{product.name}</SelectItem>
          ))}
        </Select>
      </div>

      {showServiceTypeSelect ? (
        <div className="space-y-2">
          <p className="text-sm text-default-500">
            {SERVICE_TYPE_LABEL} <span className="text-danger">*</span>
          </p>
          <Select
            aria-label={SERVICE_TYPE_LABEL}
            placeholder="Selecione uma opção"
            selectedKeys={selectedServiceTypeId ? [selectedServiceTypeId] : []}
            onSelectionChange={(keys) => {
              const serviceTypeId = String(Array.from(keys)[0] ?? "");
              if (serviceTypeId) setServiceType(serviceTypeId);
            }}
            isInvalid={Boolean(serviceTypeError)}
            errorMessage={serviceTypeError}
            classNames={{ ...getSelectClassNames(Boolean(serviceTypeError)), base: "w-full" }}
          >
            {serviceTypes.map((serviceType) => (
              <SelectItem key={serviceType.id}>{getServiceTypeLabel(serviceType)}</SelectItem>
            ))}
          </Select>
        </div>
      ) : null}

      {isCombo ? (
        <div className="space-y-2">
          <div className="flex flex-row flex-wrap items-center gap-6">
            {FRANCHISE_COMBO_CHECKBOX_LABELS.map((label) => (
              <Checkbox
                key={label}
                classNames={defaultCheckboxClassNames}
                isSelected={comboSelectedLabels.includes(label)}
                isDisabled={
                  !comboSelectedLabels.includes(label) &&
                  comboMemberRows.length >= MAX_COMBO_SELECTIONS
                }
                onValueChange={(checked) => toggleComboCheckbox(label, checked)}
              >
                {label}
              </Checkbox>
            ))}
          </div>
          {comboError ? <p className="text-sm text-danger">{comboError}</p> : null}
        </div>
      ) : null}
    </div>
  );
});