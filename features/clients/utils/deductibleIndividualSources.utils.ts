/**
 * Coleta IDs de fontes pertencentes aos grupos vinculados.
 */
export function collectBundleDataSourceIds(
  bundleDetails: Array<{ dataSources?: Array<{ id: string }> }>,
): Set<string> {
  const ids = new Set<string>();

  for (const bundle of bundleDetails) {
    for (const source of bundle.dataSources ?? []) {
      ids.add(source.id);
    }
  }

  return ids;
}

/**
 * Filtra fontes vinculadas, mantendo apenas vínculos individuais (fora dos grupos).
 */
export function filterIndividualLinkedDataSources<T extends { id: string }>(
  linkedSources: T[],
  bundleSourceIds: Set<string>,
): T[] {
  if (bundleSourceIds.size === 0) {
    return linkedSources;
  }

  return linkedSources.filter((source) => !bundleSourceIds.has(source.id));
}

/**
 * IDs de fontes sincronizadas por grupos removidos que devem ser desvinculadas.
 */
export function resolveSyncedSourceIdsToRemove(
  removedBundleSourceIds: Set<string>,
  remainingBundleSourceIds: Set<string>,
  explicitDataSourceIds: string[],
): string[] {
  const explicitSet = new Set(explicitDataSourceIds);

  return [...removedBundleSourceIds].filter(
    (sourceId) =>
      !explicitSet.has(sourceId) && !remainingBundleSourceIds.has(sourceId),
  );
}

type ResolveIndividualLinkedSourcesParams<T extends { id: string }> = {
  linkedSources: T[];
  bundleIds: string[];
  bundleDetails: Array<{ dataSources?: Array<{ id: string }> }>;
  isLoadingBundles: boolean;
  isLoadingSources: boolean;
  isLoadingBundleDetails: boolean;
};

/**
 * Resolve fontes individuais apenas quando bundles e detalhes necessários
 * já foram carregados, evitando exibir fontes de grupo antes do filtro.
 */
export function resolveIndividualLinkedDataSources<T extends { id: string }>({
  linkedSources,
  bundleIds,
  bundleDetails,
  isLoadingBundles,
  isLoadingSources,
  isLoadingBundleDetails,
}: ResolveIndividualLinkedSourcesParams<T>): T[] {
  if (isLoadingBundles || isLoadingSources) {
    return [];
  }

  if (bundleIds.length === 0) {
    return linkedSources;
  }

  if (isLoadingBundleDetails) {
    return [];
  }

  const bundleSourceIds = collectBundleDataSourceIds(bundleDetails);
  return filterIndividualLinkedDataSources(linkedSources, bundleSourceIds);
}
