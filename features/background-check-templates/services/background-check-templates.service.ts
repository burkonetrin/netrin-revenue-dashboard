/**
 * Serviço HTTP para CRUD e vínculos de modelos de background check — protótipo mock.
 */

import * as mock from "@/features/providers/mock/providersMockStore";
import type {
  ListBundleLinkedClientsParams,
  PaginatedBundleLinkedClientsResponse,
} from "@/features/providers/types/data-source-bundles.types";
import type {
  AssignBackgroundCheckTemplateDataSourcesRequest,
  AssignBackgroundCheckTemplateToDeductibleRequest,
  BackgroundCheckTemplate,
  BackgroundCheckTemplateDataSourceOption,
  CreateBackgroundCheckTemplateRequest,
  ListBackgroundCheckTemplatesParams,
  PaginatedBackgroundCheckTemplatesResponse,
  UpdateBackgroundCheckTemplateRequest,
} from "../types/background-check-templates.types";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getBackgroundCheckTemplates(
  params?: ListBackgroundCheckTemplatesParams,
): Promise<PaginatedBackgroundCheckTemplatesResponse> {
  await delay();
  return mock.mockListBackgroundCheckTemplates(params);
}

export async function getBackgroundCheckTemplatesByDeductible(
  deductibleId: string,
): Promise<BackgroundCheckTemplate[]> {
  await delay();
  return mock.mockGetBackgroundCheckTemplatesByDeductible(deductibleId);
}

export async function createBackgroundCheckTemplate(
  data: CreateBackgroundCheckTemplateRequest,
): Promise<BackgroundCheckTemplate> {
  await delay();
  return mock.mockCreateBackgroundCheckTemplate(data);
}

export async function updateBackgroundCheckTemplate(
  id: string,
  data: UpdateBackgroundCheckTemplateRequest,
): Promise<BackgroundCheckTemplate> {
  await delay();
  return mock.mockUpdateBackgroundCheckTemplate(id, data);
}

export async function deleteBackgroundCheckTemplate(id: string): Promise<void> {
  await delay();
  mock.mockDeleteBackgroundCheckTemplate(id);
}

export async function getBackgroundCheckTemplateDataSources(
  templateId: string,
): Promise<BackgroundCheckTemplateDataSourceOption[]> {
  await delay();
  return mock.mockGetBackgroundCheckTemplateDataSources(templateId);
}

export async function getBackgroundCheckTemplateLinkedClients(
  templateId: string,
  params?: ListBundleLinkedClientsParams,
): Promise<PaginatedBundleLinkedClientsResponse> {
  await delay();
  return mock.mockGetBackgroundCheckTemplateLinkedClients(templateId, params);
}

export async function assignBackgroundCheckTemplateDataSources({
  templateId,
  dataSourceIds,
}: AssignBackgroundCheckTemplateDataSourcesRequest): Promise<void> {
  await delay();
  mock.mockAssignBackgroundCheckTemplateDataSources(templateId, dataSourceIds);
}

export async function assignBackgroundCheckTemplateToDeductible(
  _payload: AssignBackgroundCheckTemplateToDeductibleRequest,
): Promise<void> {
  await delay();
  mock.mockAssignBackgroundCheckTemplateToDeductible();
}

export async function removeBackgroundCheckTemplateFromDeductible(
  _payload: AssignBackgroundCheckTemplateToDeductibleRequest,
): Promise<void> {
  await delay();
  mock.mockRemoveBackgroundCheckTemplateFromDeductible();
}
