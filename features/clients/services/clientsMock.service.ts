import type { PaginationInfo } from "@/shared/types/pagination.types";
import { CLIENTS } from "@/clientesDashboardMockData";

export interface Client {
  id: string;
  name: string;
  cnpj: string;
  fantasyName: string;
  street: string;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  zipCode: string;
  segment: string | null;
  sapCode?: string | null;
  nfeUnificationLevel?: {
    label: string;
    value: "client" | "contract" | "deductible";
  } | null;
  tenant: string;
  isTest: boolean;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ClientNfeUnificationLevel = "client" | "contract" | "deductible";

export interface PaginatedClientsResponse {
  data: Client[];
  pagination: PaginationInfo;
}

export interface ListClientsParams {
  page?: number;
  pageSize?: number;
  search?: string | null;
}

const BASE_CLIENT_FIELDS = {
  street: "Rua Exemplo",
  number: "100",
  city: "São Paulo",
  state: "SP",
  zipCode: "01000-000",
  segment: null,
  tenant: "netrin",
  isTest: false,
  isActive: true,
  isArchived: false,
  createdAt: "2024-01-15T12:00:00.000Z",
  updatedAt: "2024-01-15T12:00:00.000Z",
} as const;

const MOCK_CLIENTS: Client[] = [
  {
    id: "client-001",
    name: "Netrin",
    fantasyName: "Netrin",
    cnpj: "12.345.678/0001-90",
    ...BASE_CLIENT_FIELDS,
  },
  {
    id: "client-003",
    name: "Banco Pine S/A",
    fantasyName: "Banco Pine",
    cnpj: "62.231.365/0001-35",
    ...BASE_CLIENT_FIELDS,
  },
  {
    id: "client-004",
    name: "ACHE Laboratorios Farmaceuticos SA",
    fantasyName: "ACHE",
    cnpj: "60.659.463/0001-87",
    ...BASE_CLIENT_FIELDS,
  },
];

export function getClientById(clientId: string): Client {
  const client = MOCK_CLIENTS.find((row) => row.id === clientId);
  if (!client) {
    throw new Error("Cliente não encontrado");
  }
  return client;
}

export async function getClients(params: ListClientsParams): Promise<PaginatedClientsResponse> {
  const search = params.search?.trim().toLowerCase() ?? "";
  const data = search
    ? MOCK_CLIENTS.filter(
        (client) =>
          client.name.toLowerCase().includes(search) ||
          client.fantasyName.toLowerCase().includes(search) ||
          client.cnpj.includes(search),
      )
    : MOCK_CLIENTS;

  return {
    data: data.slice(0, params.pageSize ?? 10),
    pagination: {
      hasNext: false,
      hasPrevious: false,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      totalPages: 1,
      totalRecords: data.length,
    },
  };
}

export type ProfitCenterResponse = {
  id: string;
  code: string;
  name: string;
  isActive?: boolean;
  representativeName?: string;
  tipo?: { label: string; value: string };
};

export async function getProfitCenters(options?: { useFinancialManagementMock?: boolean }) {
  if (options?.useFinancialManagementMock === true) {
    const { mockProfitCenters } = await import("./mockProfitCenters");
    return mockProfitCenters;
  }

  return [
    { id: "pc-01", code: "01", name: "Centro 01", isActive: true },
    { id: "pc-02", code: "02", name: "Centro 02", isActive: true },
  ];
}

export type ProfitCenterSelectOption = { value: string; label: string };

export function formatProfitCenterOptions(
  profitCenters: Array<{ id: string; code: string; name: string; isActive?: boolean }>,
): ProfitCenterSelectOption[] {
  return profitCenters
    .filter((profitCenter) => profitCenter.isActive !== false)
    .map((profitCenter) => ({
      value: profitCenter.id,
      label: `${profitCenter.code} - ${profitCenter.name}`,
    }));
}

function getDashboardMockClientAsClient(clientId: string): Client | undefined {
  const row = CLIENTS.find((client) => client.id === clientId);
  if (!row) return undefined;
  return {
    id: row.id,
    name: row.nome,
    fantasyName: row.nome,
    cnpj: row.cnpj,
    ...BASE_CLIENT_FIELDS,
    isActive: row.ativo,
    nfeUnificationLevel: {
      label: "Por franquia",
      value: "deductible",
    },
  };
}

export function resolveClientForFranchiseDetail(clientId: string): Client {
  try {
    return getClientById(clientId);
  } catch {
    const dashboardClient = getDashboardMockClientAsClient(clientId);
    if (dashboardClient) return dashboardClient;
    throw new Error("Cliente não encontrado");
  }
}
