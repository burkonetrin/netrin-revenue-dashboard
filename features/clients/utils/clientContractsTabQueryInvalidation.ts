import type { QueryClient } from "@tanstack/react-query";

/**
 * Invalida caches de contratos e franquias ao reentrar na aba Contratos.
 */
export function invalidateClientContractsTabQueries(
  queryClient: QueryClient,
  clientId: string,
): void {
  void queryClient.invalidateQueries({ queryKey: ["contracts", "list", clientId] });
  void queryClient.invalidateQueries({
    predicate: (query) =>
      Array.isArray(query.queryKey) &&
      query.queryKey[0] === "contracts" &&
      query.queryKey.includes("deductibles"),
  });
}

/**
 * Invalida listagem/detalhe do contrato e franquias após mutações que alteram
 * renovação automática (CA-1, CA-2, CA-7).
 */
export function invalidateContractAutomaticRenovationViews(
  queryClient: QueryClient,
  clientId: string,
  contractId: string,
): void {
  void queryClient.invalidateQueries({ queryKey: ["contracts", "list", clientId] });
  void queryClient.invalidateQueries({
    queryKey: ["contractDetails", clientId, contractId],
  });
  void queryClient.invalidateQueries({
    queryKey: ["contracts", contractId, "deductibles"],
  });
}
