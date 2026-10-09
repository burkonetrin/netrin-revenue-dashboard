import type { QueryClient } from "@tanstack/react-query";

export const BACKGROUND_CHECK_TEMPLATES_LIST_KEY = ["background-check-templates"] as const;

export function backgroundCheckTemplateDataSourcesQueryKey(templateId: string) {
  return ["background-check-template-data-sources", templateId] as const;
}

export function deductibleBackgroundCheckTemplatesQueryKey(deductibleId: string) {
  return ["deductible-background-check-templates", deductibleId] as const;
}

export function invalidateBackgroundCheckTemplatesList(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: BACKGROUND_CHECK_TEMPLATES_LIST_KEY });
}

export function invalidateBackgroundCheckTemplateDataSources(
  queryClient: QueryClient,
  templateId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: backgroundCheckTemplateDataSourcesQueryKey(templateId),
  });
}

export function invalidateBackgroundCheckTemplatesListAndDataSources(
  queryClient: QueryClient,
  templateId: string,
) {
  invalidateBackgroundCheckTemplatesList(queryClient);
  invalidateBackgroundCheckTemplateDataSources(queryClient, templateId);
}

export function invalidateDeductibleBackgroundCheckTemplates(
  queryClient: QueryClient,
  deductibleId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: deductibleBackgroundCheckTemplatesQueryKey(deductibleId),
  });
}
