"use client";

import { CONTRACTS_MOCK } from "@/clientesDashboardMockData";
import { useQuery } from "@tanstack/react-query";

type ContractDetails = {
  id: string;
  clientId: string;
  name: string;
  minimumValue: number | null;
  isActive: boolean;
  billingModel?: { label: string; value: string };
};

export function useContractDetails(clientId: string, contractId: string) {
  return useQuery<ContractDetails>({
    queryKey: ["contractDetails", clientId, contractId],
    queryFn: async () => {
      const contract = CONTRACTS_MOCK.find((row) => row.id === contractId);
      if (!contract) throw new Error("Contrato não encontrado");
      return {
        id: contract.id,
        clientId,
        name: contract.name,
        minimumValue: contract.minimo,
        isActive: contract.ativo,
        billingModel: { label: "Preço fixo", value: "fixed_price" },
      };
    },
    enabled: Boolean(clientId) && Boolean(contractId),
  });
}