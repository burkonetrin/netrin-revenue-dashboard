/**
 * Serviço de API para CRUD de providers — protótipo usa mock local.
 */

import type {
  CreateProviderRequest,
  ProviderDetail,
  ProviderListResponse,
  ProvidersQueryParams,
  UpdateProviderRequest,
} from "../types/providers.types";
import * as mock from "../mock/providersMockStore";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getProviders(params?: ProvidersQueryParams): Promise<ProviderListResponse> {
  await delay();
  return mock.mockListProviders(params ?? {});
}

export async function getProviderById(id: string): Promise<ProviderDetail> {
  await delay();
  return mock.mockGetProviderById(id);
}

export async function createProvider(data: CreateProviderRequest): Promise<ProviderDetail> {
  await delay();
  return mock.mockCreateProvider(data);
}

export async function updateProvider(
  id: string,
  data: UpdateProviderRequest,
): Promise<ProviderDetail> {
  await delay();
  return mock.mockUpdateProvider(id, data);
}

export async function deleteProvider(id: string): Promise<void> {
  await delay();
  mock.mockDeleteProvider(id);
}
