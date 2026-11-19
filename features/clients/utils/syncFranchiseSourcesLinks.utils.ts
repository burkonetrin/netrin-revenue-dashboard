import { getDataSourceBundleById } from "@/features/providers/services/dataSourceBundles.service";
import { diffIds } from "@/features/providers/utils/bundleFormDiff.utils";
import {
  collectBundleDataSourceIds,
  resolveSyncedSourceIdsToRemove,
} from "./deductibleIndividualSources.utils";

type BundleItem = { dataSourceBundleId: string; syncWithDeductible: boolean };

type SourceMutations = {
  assignDataSources: {
    mutateAsync: (args: {
      contractId: string;
      deductibleId: string;
      data: { dataSourceIds: string[] };
    }) => Promise<unknown>;
  };
  removeDataSources: {
    mutateAsync: (args: {
      contractId: string;
      deductibleId: string;
      data: { dataSourceIds: string[] };
    }) => Promise<unknown>;
  };
  assignBundles: {
    mutateAsync: (args: {
      contractId: string;
      deductibleId: string;
      data: { items: BundleItem[] };
    }) => Promise<unknown>;
  };
  removeBundles: {
    mutateAsync: (args: {
      contractId: string;
      deductibleId: string;
      data: { items: BundleItem[] };
    }) => Promise<unknown>;
  };
};

function toBundleItems(bundleIds: string[]): BundleItem[] {
  return bundleIds.map((dataSourceBundleId) => ({
    dataSourceBundleId,
    syncWithDeductible: true,
  }));
}

async function fetchBundleSourceIds(bundleIds: string[]): Promise<Set<string>> {
  if (bundleIds.length === 0) {
    return new Set();
  }

  const details = await Promise.all(
    bundleIds.map((bundleId) => getDataSourceBundleById(bundleId)),
  );

  return collectBundleDataSourceIds(details);
}

async function syncEditModeSources(
  contractId: string,
  targetDeductibleId: string,
  bundleIds: string[],
  dataSourceIds: string[],
  snapshot: { bundleIds: string[]; dataSourceIds: string[] },
  mutations: SourceMutations,
) {
  const bundleDiff = diffIds(bundleIds, snapshot.bundleIds);
  const sourceDiff = diffIds(dataSourceIds, snapshot.dataSourceIds);

  if (sourceDiff.added.length > 0) {
    await mutations.assignDataSources.mutateAsync({
      contractId,
      deductibleId: targetDeductibleId,
      data: { dataSourceIds: sourceDiff.added },
    });
  }

  if (bundleDiff.added.length > 0) {
    await mutations.assignBundles.mutateAsync({
      contractId,
      deductibleId: targetDeductibleId,
      data: { items: toBundleItems(bundleDiff.added) },
    });
  }

  if (bundleDiff.removed.length > 0) {
    await mutations.removeBundles.mutateAsync({
      contractId,
      deductibleId: targetDeductibleId,
      data: { items: toBundleItems(bundleDiff.removed) },
    });
  }

  let dataSourceIdsToRemove = [...sourceDiff.removed];

  if (bundleDiff.removed.length > 0) {
    const [removedBundleSourceIds, remainingBundleSourceIds] = await Promise.all([
      fetchBundleSourceIds(bundleDiff.removed),
      fetchBundleSourceIds(bundleIds),
    ]);

    const syncedSourceIdsToRemove = resolveSyncedSourceIdsToRemove(
      removedBundleSourceIds,
      remainingBundleSourceIds,
      dataSourceIds,
    );

    dataSourceIdsToRemove = [
      ...new Set([...dataSourceIdsToRemove, ...syncedSourceIdsToRemove]),
    ];
  }

  if (dataSourceIdsToRemove.length > 0) {
    await mutations.removeDataSources.mutateAsync({
      contractId,
      deductibleId: targetDeductibleId,
      data: { dataSourceIds: dataSourceIdsToRemove },
    });
  }
}

async function syncCreateModeSources(
  contractId: string,
  targetDeductibleId: string,
  bundleIds: string[],
  dataSourceIds: string[],
  mutations: SourceMutations,
) {
  if (dataSourceIds.length > 0) {
    await mutations.assignDataSources.mutateAsync({
      contractId,
      deductibleId: targetDeductibleId,
      data: { dataSourceIds },
    });
  }
  if (bundleIds.length > 0) {
    await mutations.assignBundles.mutateAsync({
      contractId,
      deductibleId: targetDeductibleId,
      data: { items: toBundleItems(bundleIds) },
    });
  }
}

/** Sincroniza vínculos de fontes e bundles da franquia. */
export async function syncFranchiseSourcesLinks(
  contractId: string,
  targetDeductibleId: string,
  isEditMode: boolean,
  bundleIds: string[],
  dataSourceIds: string[],
  snapshot: { bundleIds: string[]; dataSourceIds: string[] },
  mutations: SourceMutations,
) {
  if (isEditMode) {
    await syncEditModeSources(
      contractId,
      targetDeductibleId,
      bundleIds,
      dataSourceIds,
      snapshot,
      mutations,
    );
    return;
  }

  await syncCreateModeSources(
    contractId,
    targetDeductibleId,
    bundleIds,
    dataSourceIds,
    mutations,
  );
}
