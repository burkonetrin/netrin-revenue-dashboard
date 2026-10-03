import type { PaginationInfo } from "@/shared/types/pagination.types";

export interface ContractListItem {
  id: string;
  clientId: string;
  name: string;
  isActive: boolean;
}

export interface PaginatedContractsResponse {
  data: ContractListItem[];
  pagination: PaginationInfo;
}

export interface ListContractsByClientParams {
  page?: number;
  pageSize?: number;
}

export async function getContracts(params: {
  clientId?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedContractsResponse> {
  const contractsByClient: Record<string, ContractListItem[]> = {
    "client-001": [
      { id: "contract-005", clientId: "client-001", name: "Contrato Netrin", isActive: true },
    ],
    "client-003": [
      { id: "contract-003-a", clientId: "client-003", name: "Contrato A", isActive: true },
      { id: "contract-003-b", clientId: "client-003", name: "Contrato B", isActive: true },
    ],
    "client-004": [
      { id: "contract-004", clientId: "client-004", name: "Contrato Único", isActive: true },
    ],
  };

  const data = params.clientId ? (contractsByClient[params.clientId] ?? []) : [];

  return {
    data,
    pagination: {
      hasNext: false,
      hasPrevious: false,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      totalPages: 1,
      totalRecords: data.length,
    },
  };
}
