"use client";

import { Button } from "@heroui/react";
import { PermissionGuard } from "@/shared/components/guards/PermissionGuard";
import { CLIENTS_PERMISSIONS } from "../constants/clientsPermissions.constants";
import type { DeductibleProduct } from "../types/deductibles.types";

interface FranchiseLinkedProductsTabProps {
  products: DeductibleProduct[];
  onEdit: () => void;
}

function formatServiceType(product: DeductibleProduct) {
  const serviceTypeId =
    product.serviceType?.id ??
    product.service_type?.id ??
    product.serviceTypeId ??
    product.service_type_id;
  const serviceType =
    product.serviceType ??
    product.service_type ??
    product.serviceTypes?.find((item) => item.id === serviceTypeId);

  if (!serviceType) return serviceTypeId ?? null;

  const internalName = serviceType.internalName ?? serviceType.internal_name;

  return internalName && internalName !== serviceType.name
    ? `${serviceType.name} (${internalName})`
    : serviceType.name;
}

/**
 * Aba de produtos vinculados à franquia.
 */
export function FranchiseLinkedProductsTab({ products, onEdit }: FranchiseLinkedProductsTabProps) {
  return (
    <div className="mt-6 space-y-5">
      <PermissionGuard permission={CLIENTS_PERMISSIONS.deductibleUpdateOverview}>
        <Button color="primary" className="px-6 w-fit" radius="sm" onPress={onEdit}>
          Editar
        </Button>
      </PermissionGuard>

      {products.length === 0 ? (
        <p className="text-sm text-default-400">Nenhum produto vinculado</p>
      ) : (
        <div className="border border-default-200 rounded-lg overflow-hidden">
          {products.map((product) => (
            <div
              key={product.id}
              className="min-h-12 px-4 py-3 border-b border-default-200 last:border-b-0 grid grid-cols-1 gap-1 bg-default-50 sm:grid-cols-[minmax(0,1fr)_240px] sm:items-center"
            >
              <span className="text-sm text-default-800">{product.name}</span>
              {formatServiceType(product) && (
                <span className="text-xs text-default-500 sm:text-right">
                  Tipo de serviço: {formatServiceType(product)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
