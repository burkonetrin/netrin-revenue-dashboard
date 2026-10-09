import type { QueryClient } from "@tanstack/react-query";

export const PROVIDERS_LIST_KEY = ["providers"] as const;
export const DATA_SOURCE_BUNDLES_LIST_KEY = ["data-source-bundles"] as const;
export const DATA_SOURCES_LIST_KEY = ["data-sources"] as const;

export function providerDetailQueryKey(id: string) {
  return ["providers", "detail", id] as const;
}

export function invalidateProvidersList(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: PROVIDERS_LIST_KEY });
}

export function invalidateProviderDetail(queryClient: QueryClient, id: string) {
  void queryClient.invalidateQueries({ queryKey: providerDetailQueryKey(id) });
}

export function invalidateProvidersListAndDetail(queryClient: QueryClient, id: string) {
  invalidateProvidersList(queryClient);
  invalidateProviderDetail(queryClient, id);
}

export function dataSourceBundleDetailQueryKey(id: string) {
  return ["data-source-bundles", id] as const;
}

export function dataSourceDetailQueryKey(id: string) {
  return ["data-sources", id] as const;
}

export function invalidateDataSourceBundlesList(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: DATA_SOURCE_BUNDLES_LIST_KEY });
}

export function invalidateDataSourceBundleDetail(queryClient: QueryClient, id: string) {
  void queryClient.invalidateQueries({ queryKey: dataSourceBundleDetailQueryKey(id) });
}

export function invalidateDataSourceBundlesListAndDetail(queryClient: QueryClient, id: string) {
  invalidateDataSourceBundlesList(queryClient);
  invalidateDataSourceBundleDetail(queryClient, id);
}

export function invalidateDataSourcesListAndDetail(queryClient: QueryClient, id: string) {
  void queryClient.invalidateQueries({ queryKey: DATA_SOURCES_LIST_KEY });
  void queryClient.invalidateQueries({ queryKey: dataSourceDetailQueryKey(id) });
}
