"use client";

/**
 * Listagem de permissões RBAC agrupadas por produto.
 */

import { useMemo, useState } from "react";
import { Button, Spinner, Tooltip } from "@heroui/react";
import { ChevronDown, ChevronRight, Lock, Plus, Eye } from "lucide-react";
import { useListProducts } from "@/features/products/hooks/useListProducts";
import {
  filterVisibleProducts,
  SAFE_PARTNER_PRODUCT_ID,
} from "../constants/rbacProducts.constants";
import { useRBACPermissionsByProduct } from "../hooks/useRBACPermissionsByProduct";
import { ListRBACPermissions } from "./ListRBACPermissions";
import type { PermissionWithChildren } from "../types/permission.types";
import type { Product } from "@/features/products/types/products.types";
import { PermissionGuard } from "@/shared/components/guards/PermissionGuard";
import { RBAC_ROLES_PERMISSIONS } from "../constants/rbacRolesPermissions.constants";

interface PermissionsByProductListProps {
  onCreatePermissionForProduct: (productId: string, productName: string) => void;
  onViewLinkedClientsForProduct: (productId: string) => void;
  onCreateChild: (permission: PermissionWithChildren) => void;
  onEdit: (permission: PermissionWithChildren) => void;
  onDelete: (permission: PermissionWithChildren) => void;
  onViewLinkedClients: (permission: PermissionWithChildren) => void;
  onToggleStatus: (permission: PermissionWithChildren, isActive: boolean) => void;
  isStatusToggleLoading?: string | null;
}

interface ProductPermissionsRowProps {
  product: Product;
  permissions: PermissionWithChildren[];
  isExpanded: boolean;
  onToggle: () => void;
  onCreatePermissionForProduct: (productId: string, productName: string) => void;
  onViewLinkedClientsForProduct: (productId: string) => void;
  onCreateChild: (permission: PermissionWithChildren) => void;
  onEdit: (permission: PermissionWithChildren) => void;
  onDelete: (permission: PermissionWithChildren) => void;
  onViewLinkedClients: (permission: PermissionWithChildren) => void;
  onToggleStatus: (permission: PermissionWithChildren, isActive: boolean) => void;
  isStatusToggleLoading?: string | null;
}

/**
 * Linha expansível de permissões de um produto.
 */
function ProductPermissionsRow({
  product,
  permissions,
  isExpanded,
  onToggle,
  onCreatePermissionForProduct,
  onViewLinkedClientsForProduct,
  onCreateChild,
  onEdit,
  onDelete,
  onViewLinkedClients,
  onToggleStatus,
  isStatusToggleLoading,
}: ProductPermissionsRowProps) {
  return (
    <div className="rounded-lg border border-default-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 h-14">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onToggle}
            className="text-default-500 hover:text-default-700 shrink-0"
            aria-label={isExpanded ? "Recolher" : "Expandir"}
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          <Lock size={20} className="text-success shrink-0" />

          <span className="text-sm font-medium text-default-800 truncate">
            {product.name}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <PermissionGuard permission={RBAC_ROLES_PERMISSIONS.createRole}>
            <Button
              size="sm"
              variant="light"
              startContent={<Plus size={14} />}
              onPress={() => onCreatePermissionForProduct(product.id, product.name)}
              className="text-xs"
            >
              Cadastrar permissão
            </Button>
          </PermissionGuard>

          {/* N/A Wave 2: Eye no nível produto permanece desabilitado (regra de negócio, não gap RBAC). */}
          <Tooltip content="Indisponível no nível do produto">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              aria-label="Ver clientes vinculados"
              isDisabled
            >
              <Eye size={18} className="text-default-600" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-default-100">
          <ListRBACPermissions
            permissions={permissions}
            onCreateChild={onCreateChild}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewLinkedClients={onViewLinkedClients}
            onToggleStatus={onToggleStatus}
            isStatusToggleLoading={isStatusToggleLoading}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Accordion de permissões RBAC agrupadas por produto.
 */
export function PermissionsByProductList({
  onCreatePermissionForProduct,
  onViewLinkedClientsForProduct,
  onCreateChild,
  onEdit,
  onDelete,
  onViewLinkedClients,
  onToggleStatus,
  isStatusToggleLoading,
}: PermissionsByProductListProps) {
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(
    new Set(),
  );

  const { data: productsResponse, isLoading: isLoadingProducts } =
    useListProducts({ page: 1, pageSize: 100, sortBy: "name", sortDirection: "asc" });

  const allProducts = productsResponse?.data ?? [];

  const { safePartnerProduct, otherProducts } = useMemo(() => {
    const safePartner = allProducts.find((p) => p.id === SAFE_PARTNER_PRODUCT_ID);
    return {
      safePartnerProduct: safePartner,
      otherProducts: filterVisibleProducts(allProducts),
    };
  }, [allProducts]);

  const { permissionsByProductId, isLoading: isLoadingPermissions } =
    useRBACPermissionsByProduct();

  const toggleProduct = (productId: string) => {
    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const rowProps = {
    onCreatePermissionForProduct,
    onViewLinkedClientsForProduct,
    onCreateChild,
    onEdit,
    onDelete,
    onViewLinkedClients,
    onToggleStatus,
    isStatusToggleLoading,
  };

  if (isLoadingProducts || isLoadingPermissions) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!safePartnerProduct && otherProducts.length === 0) {
    return (
      <p className="text-sm text-default-400 py-8 text-center">
        Nenhum produto cadastrado
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {safePartnerProduct && (
        <div className="space-y-3">
          <p className="text-sm text-default-500">
            Elementos de interface Safe Partner
          </p>
          <div className="space-y-2">
            <ProductPermissionsRow
              product={safePartnerProduct}
              permissions={permissionsByProductId.get(safePartnerProduct.id) ?? []}
              isExpanded={expandedProductIds.has(safePartnerProduct.id)}
              onToggle={() => toggleProduct(safePartnerProduct.id)}
              {...rowProps}
            />
          </div>
        </div>
      )}

      {otherProducts.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-default-500">Produtos</p>
          <div className="space-y-2">
            {otherProducts.map((product) => (
              <ProductPermissionsRow
                key={product.id}
                product={product}
                permissions={permissionsByProductId.get(product.id) ?? []}
                isExpanded={expandedProductIds.has(product.id)}
                onToggle={() => toggleProduct(product.id)}
                {...rowProps}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
