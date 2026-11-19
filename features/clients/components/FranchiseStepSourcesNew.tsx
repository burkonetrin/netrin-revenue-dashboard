"use client";

import { SourceSelectionSection } from "@/features/providers/components/SourceSelectionSection";
import { useDataSourceBundlesByProductIds } from "@/features/providers/hooks/useDataSourceBundlesByProductIds";
import { Checkbox, Divider, Spinner } from "@heroui/react";
import { useEffect, useMemo } from "react";
import type { FranchiseSourcesStepState } from "../types/deductible-sources.types";

const NO_MATCHING_BUNDLES_MESSAGE =
  "Nenhum grupo de fontes encontrado para o(s) produto(s) selecionado(s)";

interface FranchiseStepSourcesNewProps {
  productIds: string[];
  state: FranchiseSourcesStepState;
  onStateChange: (next: Partial<FranchiseSourcesStepState>) => void;
  canListDataSources?: boolean;
  canListDataSourceBundles?: boolean;
}

/**
 * Passo de fontes na nova franquia.
 */
export function FranchiseStepSourcesNew({
  productIds,
  state,
  onStateChange,
  canListDataSources = true,
  canListDataSourceBundles = true,
}: FranchiseStepSourcesNewProps) {
  const { bundles, isLoading: isBundlesLoading } = useDataSourceBundlesByProductIds(productIds, {
    enabled: canListDataSourceBundles,
  });

  const filteredBundleIds = useMemo(() => new Set(bundles.map((bundle) => bundle.id)), [bundles]);

  useEffect(() => {
    if (!canListDataSourceBundles || isBundlesLoading || productIds.length === 0) {
      return;
    }

    const prunedBundleIds = state.selectedBundleIds.filter((id) => filteredBundleIds.has(id));

    if (prunedBundleIds.length !== state.selectedBundleIds.length) {
      onStateChange({ selectedBundleIds: prunedBundleIds });
    }
  }, [
    filteredBundleIds,
    canListDataSourceBundles,
    isBundlesLoading,
    productIds.length,
    state.selectedBundleIds,
    onStateChange,
  ]);

  const selectedBundleIdSet = useMemo(
    () => new Set(state.selectedBundleIds),
    [state.selectedBundleIds],
  );

  const toggleBundle = (bundleId: string, selected: boolean) => {
    const next = new Set(state.selectedBundleIds);
    if (selected) next.add(bundleId);
    else next.delete(bundleId);
    onStateChange({ selectedBundleIds: Array.from(next) });
  };

  return (
    <div className="space-y-6 font-sans">
      <h3 className="text-xl font-medium text-default-500">Grupos de fontes</h3>

      <div className="rounded-lg bg-default-50 p-6 flex flex-col gap-4">
        <p className="text-sm text-default-500">Selecione os grupos de fontes</p>

        {!canListDataSourceBundles ? (
          <p className="text-sm text-default-400">
            Você não possui permissão para listar grupos de fontes.
          </p>
        ) : isBundlesLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" color="primary" />
          </div>
        ) : bundles.length === 0 ? (
          <p className="text-sm text-default-400">{NO_MATCHING_BUNDLES_MESSAGE}</p>
        ) : (
          <div className="border border-default-200 rounded-lg bg-white max-h-[280px] overflow-y-auto">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="h-12 px-4 border-b border-default-200 last:border-b-0 flex items-center gap-3"
              >
                <Checkbox
                  isSelected={selectedBundleIdSet.has(bundle.id)}
                  onValueChange={(selected) => toggleBundle(bundle.id, selected)}
                  classNames={{ label: "text-sm text-default-800" }}
                >
                  {bundle.name}
                </Checkbox>
              </div>
            ))}
          </div>
        )}
      </div>

      <Divider className="bg-default-200" />

      <div className="rounded-lg bg-default-50 p-6 flex flex-col gap-4">
        <SourceSelectionSection
          title="Adicionar fontes individuais"
          selectedSources={state.selectedSources}
          onSelectedSourcesChange={(selectedSources) => onStateChange({ selectedSources })}
          showSearchClearButton
          enabled={canListDataSources}
        />
        {!canListDataSources ? (
          <p className="text-sm text-default-400">
            Você não possui permissão para listar fontes individuais.
          </p>
        ) : null}
      </div>
    </div>
  );
}
