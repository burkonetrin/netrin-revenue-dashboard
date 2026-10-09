"use client";

import { Checkbox } from "@heroui/react";
import { useMemo } from "react";
import { useProviders } from "../hooks/useProviders";
import type { ProviderType } from "../types/providers.types";
import type { LinkedSourceRow } from "./ProviderLinkedSourcesTable";
import { ProviderUsageCheckboxList, type UsageProviderOption } from "./ProviderUsageCheckboxList";

export const USES_INDIRECT_PROVIDERS_LABEL =
  "Este fornecedor utiliza serviços de fornecedores indiretos";

export interface ProviderIndirectUsagesSectionProps {
  providerType: ProviderType | "";
  linkedSources: LinkedSourceRow[];
  usesIndirectProviders: boolean;
  onUsesIndirectProvidersChange: (checked: boolean) => void;
  usagesByProviderId: Record<string, string[]>;
  onUsagesByProviderIdChange: (usages: Record<string, string[]>) => void;
}

/**
 * Fluxo direto → indiretos: checkbox + lista de usos com subset das fontes (SUP-06).
 */
export function ProviderIndirectUsagesSection({
  providerType,
  linkedSources,
  usesIndirectProviders,
  onUsesIndirectProvidersChange,
  usagesByProviderId,
  onUsagesByProviderIdChange,
}: ProviderIndirectUsagesSectionProps) {
  const isDirect = providerType === "direct";

  const { data: providersResponse, isLoading } = useProviders(
    {
      providerType: "indirect",
      pageSize: 100,
      isActive: true,
    },
    { enabled: isDirect && usesIndirectProviders },
  );

  const availableSources = useMemo(
    () => linkedSources.map((s) => ({ id: s.id, name: s.name })),
    [linkedSources],
  );

  const indirectProviders = useMemo<UsageProviderOption[]>(() => {
    return (providersResponse?.data ?? []).map((provider) => ({
      id: provider.id,
      name: provider.name,
      sources: availableSources,
    }));
  }, [providersResponse?.data, availableSources]);

  if (!isDirect) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <Checkbox
        isSelected={usesIndirectProviders}
        onValueChange={(checked) => {
          onUsesIndirectProvidersChange(checked);
          if (!checked) {
            onUsagesByProviderIdChange({});
          }
        }}
        classNames={{
          label: "text-sm text-default-700",
        }}
      >
        {USES_INDIRECT_PROVIDERS_LABEL}
      </Checkbox>

      {usesIndirectProviders && (
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <p className="text-sm text-default-500">Carregando fornecedores indiretos...</p>
          ) : (
            <ProviderUsageCheckboxList
              providers={indirectProviders}
              usagesByProviderId={usagesByProviderId}
              onChange={onUsagesByProviderIdChange}
              emptyMessage="Nenhum fornecedor indireto disponível"
              sourcesHeading="Selecione as fontes utilizadas por este fornecedor"
            />
          )}
        </div>
      )}
    </div>
  );
}
