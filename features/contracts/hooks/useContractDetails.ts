"use client";

import { CONTRACTS_MOCK } from "@/clientesDashboardMockData";
import { useQuery } from "@tanstack/react-query";

export function useContractDetails(contractId: string | undefined) {
  return useQuery({
    queryKey: ["contracts", contractId, "details"],
    queryFn: async () => {
      const contract = CONTRACTS_MOCK.find((row) => row.id === contractId);
      if (!contract) throw new Error("Contrato não encontrado");
      return {
        id: contract.id,
        name: contract.name,
        minimumValue: contract.minimo,
        billingModel: { label: "Preço fixo", value: "fixed_price" },
      };
    },
    enabled: Boolean(contractId),
  });
}
