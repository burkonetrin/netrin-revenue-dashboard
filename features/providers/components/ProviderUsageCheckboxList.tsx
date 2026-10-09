"use client";

import { Checkbox } from "@heroui/react";

export type UsageSourceOption = {
  id: string;
  name: string;
};

export type UsageProviderOption = {
  id: string;
  name: string;
  sources: UsageSourceOption[];
  /** True enquanto o GET das fontes do provider ainda não resolveu. */
  isSourcesLoading?: boolean;
};

export const SELECT_SOURCES_HEADING_INDIRECT = "Selecione as fontes que utilizam este fornecedor";

export const NO_SOURCES_AVAILABLE_MESSAGE =
  "Este fornecedor ainda não possui nenhuma fonte disponível ou cadastrada";

export interface ProviderUsageCheckboxListProps {
  providers: UsageProviderOption[];
  usagesByProviderId: Record<string, string[]>;
  onChange: (usagesByProviderId: Record<string, string[]>) => void;
  emptyMessage?: string;
  /**
   * Título exibido ao expandir um fornecedor com fontes (Figma indireto `3574:85506`).
   * Default: heading do fluxo indireto.
   */
  sourcesHeading?: string;
  /** Mensagem quando o fornecedor expandido não tem fontes. */
  noSourcesMessage?: string;
}

/**
 * Lista em card: provider → fontes (+ Todas), linhas expansíveis (SUP-06/07).
 */
export function ProviderUsageCheckboxList({
  providers,
  usagesByProviderId,
  onChange,
  emptyMessage = "Nenhum fornecedor disponível",
  sourcesHeading = SELECT_SOURCES_HEADING_INDIRECT,
  noSourcesMessage = NO_SOURCES_AVAILABLE_MESSAGE,
}: ProviderUsageCheckboxListProps) {
  if (providers.length === 0) {
    return <p className="text-sm text-default-500">{emptyMessage}</p>;
  }

  const setProviderUsages = (providerId: string, dataSourceIds: string[] | null) => {
    const next = { ...usagesByProviderId };
    if (dataSourceIds === null) {
      delete next[providerId];
    } else {
      next[providerId] = dataSourceIds;
    }
    onChange(next);
  };

  return (
    <ul className="overflow-hidden rounded-xl border border-default-200 bg-white divide-y divide-default-200">
      {providers.map((provider) => {
        const selectedIds = usagesByProviderId[provider.id];
        const isProviderSelected = selectedIds !== undefined;
        const selectedSet = new Set(selectedIds ?? []);
        const allSourceIds = provider.sources.map((s) => s.id);
        const hasSources = provider.sources.length > 0;
        const allSelected = hasSources && allSourceIds.every((id) => selectedSet.has(id));
        const isIndeterminate = isProviderSelected && hasSources && !allSelected;

        return (
          <li key={provider.id} className="px-4 py-3">
            <Checkbox
              isSelected={isProviderSelected}
              isIndeterminate={isIndeterminate}
              onValueChange={(checked) => {
                setProviderUsages(provider.id, checked ? [] : null);
              }}
              classNames={{
                base: "max-w-full items-start",
                label: "text-sm font-medium text-default-800",
              }}
            >
              {provider.name}
            </Checkbox>

            {isProviderSelected && (
              <div className="mt-3 flex flex-col gap-2 pl-8">
                {provider.isSourcesLoading ? (
                  <p className="text-sm text-default-500">Carregando fontes...</p>
                ) : hasSources ? (
                  <>
                    <p className="text-sm text-default-500">{sourcesHeading}</p>

                    <Checkbox
                      isSelected={allSelected}
                      onValueChange={(checked) => {
                        setProviderUsages(provider.id, checked ? [...allSourceIds] : []);
                      }}
                      classNames={{
                        label: "text-sm text-default-700",
                      }}
                    >
                      Todas
                    </Checkbox>

                    {provider.sources.map((source) => (
                      <Checkbox
                        key={source.id}
                        isSelected={selectedSet.has(source.id)}
                        onValueChange={(checked) => {
                          const current = selectedIds ?? [];
                          const nextIds = checked
                            ? [...current, source.id]
                            : current.filter((id) => id !== source.id);
                          setProviderUsages(provider.id, nextIds);
                        }}
                        classNames={{
                          label: "text-sm text-default-700",
                        }}
                      >
                        {source.name}
                      </Checkbox>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-default-500">{noSourcesMessage}</p>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
