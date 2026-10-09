"use client";

import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { Checkbox, Input } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { useProvider } from "../hooks/useProvider";
import { useProviders } from "../hooks/useProviders";
import type { GetDirectProviderResponse, ProviderType } from "../types/providers.types";
import {
  ProviderUsageCheckboxList,
  SELECT_SOURCES_HEADING_INDIRECT,
  type UsageSourceOption,
} from "./ProviderUsageCheckboxList";

export const USED_BY_DIRECT_PROVIDERS_LABEL = "Fornecedores de fontes utilizam este fornecedor";

export interface ProviderIndirectServiceSectionProps {
  providerType: ProviderType | "";
  service: string;
  onServiceChange: (service: string) => void;
  usedByDirectProviders: boolean;
  onUsedByDirectProvidersChange: (checked: boolean) => void;
  usagesByProviderId: Record<string, string[]>;
  onUsagesByProviderIdChange: (usages: Record<string, string[]>) => void;
  serviceError?: string;
}

function isDirectDetail(detail: unknown): detail is GetDirectProviderResponse {
  return Boolean(
    detail &&
      typeof detail === "object" &&
      "dataSources" in detail &&
      Array.isArray((detail as GetDirectProviderResponse).dataSources),
  );
}

/** Carrega fontes do direto selecionado e reporta ao pai (um hook por provider). */
function DirectProviderSourcesLoader({
  providerId,
  enabled,
  onStatus,
}: {
  providerId: string;
  enabled: boolean;
  onStatus: (
    providerId: string,
    status: { isLoading: boolean; sources: UsageSourceOption[] },
  ) => void;
}) {
  const { data: detail, isLoading } = useProvider(providerId, { enabled });

  useEffect(() => {
    if (!enabled) {
      onStatus(providerId, { isLoading: false, sources: [] });
      return;
    }

    if (isLoading) {
      onStatus(providerId, { isLoading: true, sources: [] });
      return;
    }

    const sources = isDirectDetail(detail)
      ? detail.dataSources.map((ds) => ({ id: ds.id, name: ds.name }))
      : [];
    onStatus(providerId, { isLoading: false, sources });
  }, [providerId, enabled, isLoading, detail, onStatus]);

  return null;
}

/**
 * Fluxo indireto: Serviço + checkbox de diretos que usam este fornecedor (SUP-07).
 * Lista em card expansível — Figma `3574:85506`.
 */
export function ProviderIndirectServiceSection({
  providerType,
  service,
  onServiceChange,
  usedByDirectProviders,
  onUsedByDirectProvidersChange,
  usagesByProviderId,
  onUsagesByProviderIdChange,
  serviceError,
}: ProviderIndirectServiceSectionProps) {
  const isIndirect = providerType === "indirect";
  const [sourcesByProviderId, setSourcesByProviderId] = useState<
    Record<string, UsageSourceOption[]>
  >({});
  const [loadingByProviderId, setLoadingByProviderId] = useState<Record<string, boolean>>({});

  const { data: directsResponse, isLoading } = useProviders(
    {
      providerType: "direct",
      pageSize: 100,
      isActive: true,
    },
    { enabled: isIndirect && usedByDirectProviders },
  );

  const directs = directsResponse?.data ?? [];

  const handleSourcesStatus = useMemo(
    () => (providerId: string, status: { isLoading: boolean; sources: UsageSourceOption[] }) => {
      setLoadingByProviderId((prev) => {
        if (prev[providerId] === status.isLoading) return prev;
        return { ...prev, [providerId]: status.isLoading };
      });
      setSourcesByProviderId((prev) => {
        const current = prev[providerId];
        const sameLength = current?.length === status.sources.length;
        const sameIds =
          sameLength && current.every((s, index) => s.id === status.sources[index]?.id);
        if (sameIds) return prev;
        return { ...prev, [providerId]: status.sources };
      });
    },
    [],
  );

  const listProviders = useMemo(
    () =>
      directs.map((provider) => {
        const isSelected = usagesByProviderId[provider.id] !== undefined;
        return {
          id: provider.id,
          name: provider.name,
          sources: sourcesByProviderId[provider.id] ?? [],
          isSourcesLoading: isSelected && Boolean(loadingByProviderId[provider.id]),
        };
      }),
    [directs, sourcesByProviderId, loadingByProviderId, usagesByProviderId],
  );

  if (!isIndirect) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <Input
        label="Serviço"
        labelPlacement="outside"
        placeholder="Digite o serviço"
        radius="sm"
        value={service}
        onValueChange={onServiceChange}
        isInvalid={Boolean(serviceError)}
        errorMessage={serviceError}
        classNames={defaultInputClassNames}
      />

      <Checkbox
        isSelected={usedByDirectProviders}
        onValueChange={(checked) => {
          onUsedByDirectProvidersChange(checked);
          if (!checked) {
            onUsagesByProviderIdChange({});
            setSourcesByProviderId({});
            setLoadingByProviderId({});
          }
        }}
        classNames={{
          base: "max-w-fit",
          label: "text-sm text-default-700",
        }}
      >
        {USED_BY_DIRECT_PROVIDERS_LABEL}
      </Checkbox>

      {usedByDirectProviders && (
        <div className="flex flex-col gap-3">
          {directs.map((provider) => (
            <DirectProviderSourcesLoader
              key={provider.id}
              providerId={provider.id}
              enabled={usagesByProviderId[provider.id] !== undefined}
              onStatus={handleSourcesStatus}
            />
          ))}

          {isLoading ? (
            <p className="text-sm text-default-500">Carregando fornecedores diretos...</p>
          ) : (
            <ProviderUsageCheckboxList
              providers={listProviders}
              usagesByProviderId={usagesByProviderId}
              onChange={onUsagesByProviderIdChange}
              emptyMessage="Nenhum fornecedor direto disponível"
              sourcesHeading={SELECT_SOURCES_HEADING_INDIRECT}
            />
          )}
        </div>
      )}
    </div>
  );
}
