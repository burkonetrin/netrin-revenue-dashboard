"use client";

import { Button, Spinner } from "@heroui/react";
import { useDeductiblePaymentInfo } from "../hooks/useDeductiblePaymentInfo";
import { PaymentInfoSummary } from "./PaymentInfoSummary";
import { CLIENTS_PERMISSIONS } from "../constants/clientsPermissions.constants";
import { PermissionGuard } from "@/shared/components/guards/PermissionGuard";

interface FranchisePaymentInfoTabProps {
  clientId: string;
  contractId: string;
  franchiseId: string;
  onEdit: () => void;
}

/**
 * Aba de pagamento da franquia.
 */
export function FranchisePaymentInfoTab({
  clientId,
  contractId,
  franchiseId,
  onEdit,
}: FranchisePaymentInfoTabProps) {
  const { data: paymentInfo, isLoading } = useDeductiblePaymentInfo(
    clientId,
    contractId,
    franchiseId,
  );

  return (
    <div className="mt-6 space-y-7">
      <PermissionGuard permission={CLIENTS_PERMISSIONS.updatePaymentInfo}>
        <Button color="primary" radius="sm" className="px-6" onPress={onEdit}>
          Editar
        </Button>
      </PermissionGuard>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner color="primary" />
        </div>
      ) : paymentInfo ? (
        <PaymentInfoSummary paymentInfo={paymentInfo} showSapCode={false} />
      ) : (
        <p className="text-base text-gray-700">Nenhuma informação de pagamento cadastrada</p>
      )}
    </div>
  );
}
