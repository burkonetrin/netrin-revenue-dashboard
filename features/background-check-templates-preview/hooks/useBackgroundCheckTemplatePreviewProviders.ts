"use client";

import { useProviders } from "@/features/providers/hooks/useProviders";
import { getProviderById } from "@/features/providers/services/providers.service";
import type { ProviderDetail } from "@/features/providers/types/providers.types";
import { useQuery } from "@tanstack/react-query";

/**
 * Carrega os detalhes dos providers ativos para montar a relação fonte → provider na prévia.
 * O endpoint de listagem não inclui as fontes vinculadas, por isso os detalhes são consultados
 * depois que a lista de IDs estiver disponível.
 */
export function useBackgroundCheckTemplatePreviewProviders() {
  const providersQuery = useProviders({ page: 1, pageSize: 100, isActive: true });
  const providerIds = (providersQuery.data?.data ?? []).map((provider) => provider.id).sort();

  const detailsQuery = useQuery<ProviderDetail[]>({
    queryKey: ["background-check-template-preview-provider-details", providerIds],
    enabled: providerIds.length > 0,
    queryFn: async () => {
      const results = await Promise.allSettled(
        providerIds.map((providerId) => getProviderById(providerId)),
      );
      return results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
    },
  });

  return {
    data: detailsQuery.data ?? [],
    isLoading: providersQuery.isLoading || detailsQuery.isLoading,
  };
}
