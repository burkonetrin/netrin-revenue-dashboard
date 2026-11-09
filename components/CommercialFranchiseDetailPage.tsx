"use client";

import { FranchiseDetailsPageNew } from "@/features/clients/components/FranchiseDetailsPageNew";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { PROTOTYPE_BASE_PATH } from "@/constants";

export function CommercialFranchiseDetailPage() {
  const { clientId, franchiseId } = useParams<{ clientId: string; franchiseId: string }>();
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get("contractId") ?? undefined;

  if (!clientId || !franchiseId) {
    return <Navigate to={`${PROTOTYPE_BASE_PATH}?tab=clientes`} replace />;
  }

  if (!contractId) {
    return (
      <Navigate
        to={`${PROTOTYPE_BASE_PATH}/clientes/${clientId}?tab=contratos`}
        replace
      />
    );
  }

  return (
    <div className="bg-white -m-6 md:-m-8 min-h-full">
      <FranchiseDetailsPageNew
        clientId={clientId}
        contractId={contractId}
        franchiseId={franchiseId}
      />
    </div>
  );
}
