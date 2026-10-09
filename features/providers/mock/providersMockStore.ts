import { AxiosError } from "axios";
import type { BackgroundCheckTemplate } from "@/features/background-check-templates/types/background-check-templates.types";
import type { PaginationInfo } from "@/shared/types/pagination.types";
import type {
  AssignDataSourceIdsApiRequest,
  BundleLinkedClient,
  CreateDataSourceBundleApiRequest,
  DataSourceBundle,
  DataSourceBundleDataSourceResponse,
  DataSourceBundleQueryParams,
  DataSourceBundleResponse,
  ListBundleLinkedClientsParams,
  PatchDataSourceBundleActiveRequest,
  RemoveDataSourceIdsRequest,
  UpdateDataSourceBundleApiRequest,
} from "../types/data-source-bundles.types";
import type {
  DataSource,
  DataSourceQueryParams,
  PatchDataSourceActiveRequest,
  UpdateDataSourceRequest,
} from "../types/data-sources.types";
import type {
  CreateProviderInvoiceCompetenceRequest,
  CreateProviderInvoiceRequest,
  ProviderInvoiceBillableSourceResponse,
  ProviderInvoiceFileUploadResponse,
  ProviderInvoiceListResponse,
  ProviderInvoiceResponse,
  ProviderInvoicesQueryParams,
  UpdateProviderCreditDepositRequest,
  UpdateProviderInvoiceCompetenceRequest,
  UpdateProviderInvoiceRequest,
} from "../types/providerInvoices.types";
import type {
  CreateProviderRequest,
  GetDirectProviderResponse,
  GetIndirectProviderResponse,
  Provider,
  ProviderDetail,
  ProvidersQueryParams,
  UpdateProviderRequest,
} from "../types/providers.types";

const now = () => new Date().toISOString();

function paginate<T>(items: T[], page = 1, pageSize = 10): { data: T[]; pagination: PaginationInfo } {
  const totalRecords = items.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    pagination: {
      hasNext: safePage < totalPages,
      hasPrevious: safePage > 1,
      page: safePage,
      pageSize,
      totalPages,
      totalRecords,
    },
  };
}

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

const typeOption = (value: "direct" | "indirect") => ({
  label: value === "direct" ? "Direto" : "Indireto",
  value,
});

let dataSources: DataSource[] = [
  {
    id: "ds-receita",
    name: "Receita Federal — CNPJ",
    description: "Consulta cadastral PJ",
    internalName: "receita_cnpj",
    pathName: ["Brasil", "Receita"],
    consultationTypes: [{ label: "Pessoa jurídica", value: "br-entity" }],
    defaultCost: 0.42,
    referenceCost: 0.42,
    hasQsaBackgroundCheck: true,
    isActive: true,
    isArchived: false,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "ds-serasa",
    name: "Serasa — Score PF",
    description: "Score e restrições PF",
    internalName: "serasa_score_pf",
    pathName: ["Brasil", "Bureau"],
    consultationTypes: [{ label: "Pessoa física", value: "br-person" }],
    defaultCost: 1.15,
    referenceCost: 1.15,
    isActive: true,
    isArchived: false,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "ds-international",
    name: "WorldCheck — Entidade",
    description: "Listas internacionais",
    internalName: "worldcheck_entity",
    pathName: ["Internacional"],
    consultationTypes: [{ label: "Entidade internacional", value: "intl-entity" }],
    defaultCost: 2.8,
    referenceCost: 2.8,
    isActive: true,
    isArchived: false,
    createdAt: now(),
    updatedAt: now(),
  },
];

let providers: ProviderDetail[] = [
  {
    id: "prov-serasa-direct",
    name: "Serasa Experian",
    description: "Bureau de crédito",
    isPrepaid: false,
    isActive: true,
    providerType: typeOption("direct"),
    dataSources: [
      {
        id: "ds-serasa",
        name: "Serasa — Score PF",
        internalName: "serasa_score_pf",
        defaultCost: "1.15",
      },
    ],
    providerUsages: [],
    createdAt: now(),
    updatedAt: now(),
  } as GetDirectProviderResponse,
  {
    id: "prov-receita-direct",
    name: "Receita Federal (API)",
    description: "Fontes governamentais",
    isPrepaid: true,
    isActive: true,
    providerType: typeOption("direct"),
    dataSources: [
      {
        id: "ds-receita",
        name: "Receita Federal — CNPJ",
        internalName: "receita_cnpj",
        defaultCost: "0.42",
      },
    ],
    providerUsages: [
      {
        id: "prov-aggregator",
        name: "Agregador Netrin",
        providerType: typeOption("indirect"),
        dataSources: [
          {
            id: "ds-receita",
            name: "Receita Federal — CNPJ",
            internalName: "receita_cnpj",
            defaultCost: "0.42",
          },
        ],
      },
    ],
    createdAt: now(),
    updatedAt: now(),
  } as GetDirectProviderResponse,
  {
    id: "prov-aggregator",
    name: "Agregador Netrin",
    description: "Serviço indireto de enriquecimento",
    isPrepaid: false,
    isActive: true,
    providerType: typeOption("indirect"),
    providerUsages: [],
    createdAt: now(),
    updatedAt: now(),
  } as GetIndirectProviderResponse,
];

type BundleRecord = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  dataSourceIds: string[];
  productIds: string[];
  sourceProviders: Record<string, string | null>;
};

function productLabel(productId: string) {
  if (productId === "0195694a-939a-7c9c-b169-2f22b8264779") return "Nucleus";
  return productId;
}

function providersForSource(sourceId: string) {
  return providers.filter(
    (provider): provider is GetDirectProviderResponse =>
      provider.providerType.value === "direct" &&
      "dataSources" in provider &&
      provider.dataSources.some((dataSource) => dataSource.id === sourceId),
  );
}

function providerRef(provider: GetDirectProviderResponse) {
  return { value: provider.id, label: provider.name };
}

function buildDataSourceBundleDataSource(
  sourceId: string,
  selectedProviderId: string | null | undefined,
): DataSourceBundleDataSourceResponse {
  const dataSource = dataSources.find((item) => item.id === sourceId);
  const directProviders = providersForSource(sourceId);
  const defaultProvider = directProviders[0] ?? null;
  const selectedProvider =
    directProviders.find((provider) => provider.id === selectedProviderId) ??
    defaultProvider;

  return {
    id: sourceId,
    name: dataSource?.name ?? sourceId,
    internalName: dataSource?.internalName ?? sourceId,
    isActive: dataSource?.isActive ?? true,
    providers: directProviders.map(providerRef),
    defaultProvider: defaultProvider ? providerRef(defaultProvider) : null,
    selectedProvider: selectedProvider ? providerRef(selectedProvider) : null,
  };
}

function bundleToResponse(bundle: BundleRecord): DataSourceBundleResponse {
  const dataSourcesList = bundle.dataSourceIds.map((sourceId) =>
    buildDataSourceBundleDataSource(sourceId, bundle.sourceProviders[sourceId]),
  );

  let standardCost = 0;
  let actualCost = 0;
  for (const sourceId of bundle.dataSourceIds) {
    const dataSource = dataSources.find((item) => item.id === sourceId);
    const reference =
      typeof dataSource?.referenceCost === "number"
        ? dataSource.referenceCost
        : dataSource?.defaultCost ?? 0;
    standardCost += Number(reference) || 0;

    const providerId = bundle.sourceProviders[sourceId];
    const provider = providers.find(
      (item) => item.id === providerId && "dataSources" in item,
    ) as GetDirectProviderResponse | undefined;
    if (provider) {
      const link = provider.dataSources.find((item) => item.id === sourceId);
      const parsed = link
        ? Number.parseFloat(String(link.defaultCost).replace(",", "."))
        : 0;
      actualCost += Number.isFinite(parsed) ? parsed : 0;
    }
  }

  return {
    id: bundle.id,
    name: bundle.name,
    description: bundle.description ?? null,
    isActive: bundle.isActive,
    isArchived: bundle.isArchived,
    dataSourceCount: bundle.dataSourceIds.length,
    createdAt: bundle.createdAt,
    updatedAt: bundle.updatedAt,
    products: bundle.productIds.map((productId) => ({
      value: productId,
      label: productLabel(productId),
    })),
    dataSources: dataSourcesList,
    standardCost: bundle.dataSourceIds.length > 0 ? standardCost : null,
    actualCost: bundle.dataSourceIds.length > 0 ? actualCost : null,
  };
}

let bundles: BundleRecord[] = [
  {
    id: "bundle-bgc-core",
    name: "BGC Core",
    description: "Pacote base de background check",
    isActive: true,
    isArchived: false,
    createdAt: now(),
    updatedAt: now(),
    dataSourceIds: ["ds-receita", "ds-serasa"],
    productIds: ["0195694a-939a-7c9c-b169-2f22b8264779"],
    sourceProviders: {
      "ds-receita": "prov-receita-direct",
      "ds-serasa": "prov-serasa-direct",
    },
  },
];

const bundleLinkedClients: Record<string, BundleLinkedClient[]> = {
  "bundle-bgc-core": [
    {
      id: "client-acme",
      name: "ACME Indústria",
      deductibles: [
        { id: "ded-1", name: "Franquia Nacional" },
        { id: "ded-2", name: "Franquia SP" },
      ],
    },
    {
      id: "client-beta",
      name: "Beta Serviços",
      deductibles: [{ id: "ded-3", name: "Franquia única" }],
    },
  ],
};

let invoices: ProviderInvoiceResponse[] = [
  {
    id: "inv-serasa-2025-09",
    providerId: "prov-serasa-direct",
    providerName: "Serasa Experian",
    providerType: typeOption("direct"),
    isPrepaid: false,
    competenceMonth: "2025-09",
    assessmentStartDate: "2025-09-01",
    assessmentEndDate: "2025-09-30",
    invoiceTotalValue: "18450.00",
    minimumFranchiseValue: null,
    invoiceFileUrl: null,
    sourcesTotalValue: "18450.00",
    isOpen: true,
    isActive: true,
    isArchived: false,
    sources: [],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "comp-receita-2025-09",
    providerId: "prov-receita-direct",
    providerName: "Receita Federal (API)",
    providerType: typeOption("direct"),
    isPrepaid: true,
    competenceMonth: "2025-09",
    assessmentStartDate: "2025-09-01",
    assessmentEndDate: "2025-09-30",
    invoiceTotalValue: "0",
    startingBalance: "12000.00",
    endingBalance: "8450.00",
    isMonthClosed: false,
    sourcesTotalValue: "3550.00",
    isOpen: true,
    isActive: true,
    isArchived: false,
    sources: [],
    creditDeposits: [
      {
        id: "dep-1",
        paidAt: "2025-09-05",
        creditedAt: "2025-09-05",
        balanceBeforeCredit: "0",
        creditAmount: "12000.00",
        balanceAfterCredit: "12000.00",
        consumedValue: "3550.00",
      },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
];

let bgcTemplates: BackgroundCheckTemplate[] = [
  {
    id: "bgc-pf-standard",
    name: "BGC PF Padrão",
    description: "Modelo pessoa física",
    consultationType: { label: "Pessoa física", value: "br-person" },
    commercialName: "Consulta PF",
    sourcesCount: 1,
    clientsCount: 12,
    isActive: true,
    hasQsaBackgroundCheck: false,
  },
  {
    id: "bgc-pj-qsa",
    name: "BGC PJ com QSA",
    description: "Modelo PJ com quadro societário",
    consultationType: { label: "Pessoa jurídica", value: "br-entity" },
    commercialName: "Consulta PJ + QSA",
    sourcesCount: 2,
    clientsCount: 8,
    isActive: true,
    hasQsaBackgroundCheck: true,
  },
];

const bgcTemplateDataSources: Record<string, string[]> = {
  "bgc-pf-standard": ["ds-serasa"],
  "bgc-pj-qsa": ["ds-receita", "ds-serasa"],
};

const bgcTemplateLinkedClients: Record<string, BundleLinkedClient[]> = {
  "bgc-pf-standard": [
    {
      id: "client-acme",
      name: "ACME Indústria",
      deductibles: [{ id: "ded-1", name: "Franquia Nacional" }],
    },
  ],
  "bgc-pj-qsa": [
    {
      id: "client-beta",
      name: "Beta Serviços",
      deductibles: [
        { id: "ded-3", name: "Franquia única" },
        { id: "ded-4", name: "Franquia RJ" },
      ],
    },
  ],
};

function notFound(message: string): never {
  throw new AxiosError(message, undefined, undefined, undefined, {
    status: 404,
    data: { message },
  } as never);
}

export function mockListProviders(params: ProvidersQueryParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  let list = providers.filter((p) => !p.isArchived);
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q));
  }
  if (params.providerType) {
    list = list.filter((p) => p.providerType.value === params.providerType);
  }
  if (params.isActive !== undefined && params.isActive !== null) {
    list = list.filter((p) => p.isActive === params.isActive);
  }
  const { data, pagination } = paginate(list as Provider[], page, pageSize);
  return { data, pagination };
}

export function mockGetProviderById(id: string): ProviderDetail {
  const found = providers.find((p) => p.id === id && !p.isArchived);
  if (!found) notFound("Fornecedor não encontrado");
  return { ...found };
}

export function mockCreateProvider(data: CreateProviderRequest): ProviderDetail {
  const id = newId("prov");
  const base = {
    id,
    name: data.name,
    description: data.description ?? null,
    isPrepaid: data.isPrepaid,
    isActive: data.isActive ?? true,
    providerType: typeOption(data.providerType),
    providerUsages: [],
    createdAt: now(),
    updatedAt: now(),
  };
  const detail: ProviderDetail =
    data.providerType === "direct"
      ? {
          ...base,
          dataSources: (data.dataSourceIds ?? []).map((dsId) => {
            const ds = dataSources.find((d) => d.id === dsId);
            return {
              id: dsId,
              name: ds?.name ?? dsId,
              internalName: ds?.internalName ?? dsId,
              defaultCost: String(ds?.defaultCost ?? "0"),
            };
          }),
        }
      : { ...base, providerUsages: [] };
  providers = [detail, ...providers];
  return detail;
}

export function mockUpdateProvider(id: string, data: UpdateProviderRequest): ProviderDetail {
  const idx = providers.findIndex((p) => p.id === id);
  if (idx < 0) notFound("Fornecedor não encontrado");
  const current = providers[idx];
  const updated: ProviderDetail = {
    ...current,
    name: data.name,
    description: data.description ?? current.description,
    updatedAt: now(),
  };
  if ("dataSources" in current && data.dataSourceIds) {
    (updated as GetDirectProviderResponse).dataSources = data.dataSourceIds.map((dsId) => {
      const ds = dataSources.find((d) => d.id === dsId);
      return {
        id: dsId,
        name: ds?.name ?? dsId,
        internalName: ds?.internalName ?? dsId,
        defaultCost: String(ds?.defaultCost ?? "0"),
      };
    });
  }
  providers[idx] = updated;
  return updated;
}

export function mockDeleteProvider(id: string): void {
  const idx = providers.findIndex((p) => p.id === id);
  if (idx < 0) notFound("Fornecedor não encontrado");
  providers[idx] = { ...providers[idx], isArchived: true, isActive: false };
}

export function mockListDataSources(params: DataSourceQueryParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  let list = dataSources.filter((d) => !d.isArchived);
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.internalName.toLowerCase().includes(q),
    );
  }
  if (params.isActive !== undefined) {
    list = list.filter((d) => d.isActive === params.isActive);
  }
  return paginate(list, page, pageSize);
}

export function mockGetDataSourceById(id: string): DataSource {
  const found = dataSources.find((d) => d.id === id);
  if (!found) notFound("Fonte não encontrada");
  return { ...found };
}

export function mockUpdateDataSource(id: string, data: UpdateDataSourceRequest): DataSource {
  const idx = dataSources.findIndex((d) => d.id === id);
  if (idx < 0) notFound("Fonte não encontrada");
  dataSources[idx] = { ...dataSources[idx], ...data, updatedAt: now() };
  return dataSources[idx];
}

export function mockPatchDataSourceActive(
  id: string,
  data: PatchDataSourceActiveRequest,
): DataSource {
  const idx = dataSources.findIndex((d) => d.id === id);
  if (idx < 0) notFound("Fonte não encontrada");
  dataSources[idx] = { ...dataSources[idx], isActive: data.isActive, updatedAt: now() };
  return dataSources[idx];
}

export function mockListDataSourceBundles(params: DataSourceBundleQueryParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  let list = bundles.filter((bundle) => !bundle.isArchived).map(bundleToResponse);
  if (params.search) {
    const query = params.search.toLowerCase();
    list = list.filter((bundle) => {
      if (bundle.name.toLowerCase().includes(query)) return true;
      return (bundle.dataSources ?? []).some(
        (source) =>
          source.name.toLowerCase().includes(query) ||
          source.internalName.toLowerCase().includes(query),
      );
    });
  }
  if (params.dataSourceId) {
    list = list.filter((bundle) =>
      (bundle.dataSources ?? []).some((source) => source.id === params.dataSourceId),
    );
  }
  return paginate(list, page, pageSize);
}

export function mockGetDataSourceBundleById(id: string): DataSourceBundleResponse {
  const found = bundles.find((bundle) => bundle.id === id);
  if (!found) notFound("Grupo de fontes não encontrado");
  return bundleToResponse(found);
}

export function mockCreateDataSourceBundle(
  data: CreateDataSourceBundleApiRequest,
): DataSourceBundle {
  const id = newId("bundle");
  const record: BundleRecord = {
    id,
    name: data.name,
    description: null,
    isActive: data.isActive ?? true,
    isArchived: false,
    createdAt: now(),
    updatedAt: now(),
    dataSourceIds: [],
    productIds: data.productIds ?? [],
    sourceProviders: {},
  };
  bundles = [record, ...bundles];
  return bundleToResponse(record);
}

export function mockUpdateDataSourceBundle(
  id: string,
  data: UpdateDataSourceBundleApiRequest,
): DataSourceBundle {
  const idx = bundles.findIndex((bundle) => bundle.id === id);
  if (idx < 0) notFound("Grupo de fontes não encontrado");
  bundles[idx] = {
    ...bundles[idx],
    name: data.name,
    productIds: data.productIds ?? bundles[idx].productIds,
    updatedAt: now(),
  };
  return bundleToResponse(bundles[idx]);
}

export function mockPatchDataSourceBundleActive(
  id: string,
  data: PatchDataSourceBundleActiveRequest,
): DataSourceBundle {
  const idx = bundles.findIndex((bundle) => bundle.id === id);
  if (idx < 0) notFound("Grupo de fontes não encontrado");
  bundles[idx] = { ...bundles[idx], isActive: data.isActive, updatedAt: now() };
  return bundleToResponse(bundles[idx]);
}

export function mockDeleteDataSourceBundle(id: string): void {
  const idx = bundles.findIndex((b) => b.id === id);
  if (idx < 0) notFound("Grupo de fontes não encontrado");
  bundles[idx] = { ...bundles[idx], isArchived: true, isActive: false };
}

export function mockAssignBundleDataSources(
  id: string,
  data: AssignDataSourceIdsApiRequest,
): number {
  const idx = bundles.findIndex((bundle) => bundle.id === id);
  if (idx < 0) notFound("Grupo de fontes não encontrado");

  for (const sourceId of data.dataSourceIds) {
    if (!bundles[idx].dataSourceIds.includes(sourceId)) {
      bundles[idx].dataSourceIds.push(sourceId);
    }
    if (data.providerId) {
      bundles[idx].sourceProviders[sourceId] = data.providerId;
    } else if (!(sourceId in bundles[idx].sourceProviders)) {
      const defaultProvider = providersForSource(sourceId)[0];
      bundles[idx].sourceProviders[sourceId] = defaultProvider?.id ?? null;
    }
  }

  bundles[idx].updatedAt = now();
  return 200;
}

export function mockRemoveBundleDataSources(
  id: string,
  data: RemoveDataSourceIdsRequest,
): number {
  const idx = bundles.findIndex((bundle) => bundle.id === id);
  if (idx < 0) notFound("Grupo de fontes não encontrado");
  bundles[idx].dataSourceIds = bundles[idx].dataSourceIds.filter(
    (sourceId) => !data.dataSourceIds.includes(sourceId),
  );
  for (const sourceId of data.dataSourceIds) {
    delete bundles[idx].sourceProviders[sourceId];
  }
  bundles[idx].updatedAt = now();
  return 200;
}

export function mockGetBundleLinkedClients(
  bundleId: string,
  params: ListBundleLinkedClientsParams = {},
) {
  const clients = bundleLinkedClients[bundleId] ?? [];
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 100;
  return paginate(clients, page, pageSize);
}

export function mockListProviderInvoices(
  providerId: string,
  params: ProviderInvoicesQueryParams = {},
): ProviderInvoiceListResponse {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const list = invoices.filter((i) => i.providerId === providerId && !i.isArchived);
  return paginate(list, page, pageSize);
}

export function mockListBillableInvoiceSources(
  _providerId: string,
): ProviderInvoiceBillableSourceResponse[] {
  return [
    {
      directProviderId: "prov-serasa-direct",
      directProviderName: "Serasa Experian",
      dataSourceProviderId: "ds-serasa",
      dataSourceName: "Serasa — Score PF",
      dataSourceInternalName: "serasa_score_pf",
      clientBillableQuantity: 4200,
    },
    {
      directProviderId: "prov-receita-direct",
      directProviderName: "Receita Federal (API)",
      dataSourceProviderId: "ds-receita",
      dataSourceName: "Receita Federal — CNPJ",
      dataSourceInternalName: "receita_cnpj",
      clientBillableQuantity: 1800,
    },
  ];
}

export function mockUploadProviderInvoiceFile(
  _providerId: string,
  _competenceMonth: string,
): ProviderInvoiceFileUploadResponse {
  return { invoiceFileUrl: "https://mock.local/invoice.pdf" };
}

function buildInvoiceFromPostpaid(
  providerId: string,
  payload: CreateProviderInvoiceRequest,
): ProviderInvoiceResponse {
  const provider = mockGetProviderById(providerId);
  return {
    id: newId("inv"),
    providerId,
    providerName: provider.name,
    providerType: provider.providerType,
    isPrepaid: false,
    competenceMonth: payload.competenceMonth,
    assessmentStartDate: payload.assessmentStartDate,
    assessmentEndDate: payload.assessmentEndDate,
    invoiceTotalValue: String(payload.invoiceTotalValue ?? "0"),
    minimumFranchiseValue: payload.minimumFranchiseValue
      ? String(payload.minimumFranchiseValue)
      : null,
    invoiceFileUrl: payload.invoiceFileUrl ?? null,
    sourcesTotalValue: String(payload.invoiceTotalValue ?? "0"),
    isOpen: true,
    isActive: true,
    isArchived: false,
    sources: [],
    createdAt: now(),
    updatedAt: now(),
  };
}

export function mockCreateProviderInvoice(
  providerId: string,
  payload: CreateProviderInvoiceRequest,
): ProviderInvoiceResponse {
  const inv = buildInvoiceFromPostpaid(providerId, payload);
  invoices = [inv, ...invoices];
  return inv;
}

export function mockUpdateProviderInvoice(
  providerId: string,
  invoiceId: string,
  payload: UpdateProviderInvoiceRequest,
): ProviderInvoiceResponse {
  const idx = invoices.findIndex((i) => i.id === invoiceId && i.providerId === providerId);
  if (idx < 0) notFound("Fatura não encontrada");
  invoices[idx] = {
    ...invoices[idx],
    competenceMonth: payload.competenceMonth,
    assessmentStartDate: payload.assessmentStartDate,
    assessmentEndDate: payload.assessmentEndDate,
    invoiceTotalValue: String(payload.invoiceTotalValue ?? invoices[idx].invoiceTotalValue),
    minimumFranchiseValue: payload.minimumFranchiseValue
      ? String(payload.minimumFranchiseValue)
      : invoices[idx].minimumFranchiseValue,
    invoiceFileUrl: payload.invoiceFileUrl ?? invoices[idx].invoiceFileUrl,
    updatedAt: now(),
  };
  return invoices[idx];
}

export function mockCreateProviderInvoiceCompetence(
  providerId: string,
  payload: CreateProviderInvoiceCompetenceRequest,
): ProviderInvoiceResponse {
  const provider = mockGetProviderById(providerId);
  const inv: ProviderInvoiceResponse = {
    id: newId("comp"),
    providerId,
    providerName: provider.name,
    providerType: provider.providerType,
    isPrepaid: true,
    competenceMonth: payload.competenceMonth,
    assessmentStartDate: payload.assessmentStartDate,
    assessmentEndDate: payload.assessmentEndDate,
    invoiceTotalValue: "0",
    startingBalance: String(payload.startingBalance),
    endingBalance: payload.endingBalance ? String(payload.endingBalance) : null,
    isMonthClosed: payload.isMonthClosed ?? false,
    sourcesTotalValue: "0",
    isOpen: true,
    isActive: true,
    isArchived: false,
    sources: [],
    creditDeposits: [],
    createdAt: now(),
    updatedAt: now(),
  };
  invoices = [inv, ...invoices];
  return inv;
}

export function mockUpdateProviderInvoiceCompetence(
  providerId: string,
  invoiceId: string,
  payload: UpdateProviderInvoiceCompetenceRequest,
): ProviderInvoiceResponse {
  const idx = invoices.findIndex((i) => i.id === invoiceId && i.providerId === providerId);
  if (idx < 0) notFound("Competência não encontrada");
  invoices[idx] = {
    ...invoices[idx],
    competenceMonth: payload.competenceMonth,
    assessmentStartDate: payload.assessmentStartDate,
    assessmentEndDate: payload.assessmentEndDate,
    startingBalance: String(payload.startingBalance),
    updatedAt: now(),
  };
  return invoices[idx];
}

export function mockAddProviderCreditDeposit(
  providerId: string,
  invoiceId: string,
  payload: UpdateProviderCreditDepositRequest,
): ProviderInvoiceResponse {
  const idx = invoices.findIndex((i) => i.id === invoiceId && i.providerId === providerId);
  if (idx < 0) notFound("Competência não encontrada");
  const deposit = {
    id: newId("dep"),
    paidAt: payload.paidAt ?? null,
    creditedAt: payload.creditedAt ?? null,
    balanceBeforeCredit: String(payload.balanceBeforeCredit ?? "0"),
    creditAmount: String(payload.creditAmount ?? "0"),
    balanceAfterCredit: String(
      Number(payload.balanceBeforeCredit ?? 0) + Number(payload.creditAmount ?? 0),
    ),
    consumedValue: "0",
  };
  invoices[idx] = {
    ...invoices[idx],
    creditDeposits: [...(invoices[idx].creditDeposits ?? []), deposit],
    endingBalance: payload.endingBalance ? String(payload.endingBalance) : invoices[idx].endingBalance,
    isMonthClosed: payload.isMonthClosed ?? invoices[idx].isMonthClosed,
    updatedAt: now(),
  };
  return invoices[idx];
}

export function mockRemoveProviderCreditDeposit(
  providerId: string,
  invoiceId: string,
  depositId: string,
): ProviderInvoiceResponse {
  const idx = invoices.findIndex((i) => i.id === invoiceId && i.providerId === providerId);
  if (idx < 0) notFound("Competência não encontrada");
  invoices[idx] = {
    ...invoices[idx],
    creditDeposits: (invoices[idx].creditDeposits ?? []).filter((d) => d.id !== depositId),
    updatedAt: now(),
  };
  return invoices[idx];
}

export function mockGetProviderInvoiceSnapshot(invoiceId: string): ProviderInvoiceResponse {
  const found = invoices.find((i) => i.id === invoiceId);
  if (!found) notFound("Fatura não encontrada");
  return { ...found };
}

export function mockArchiveProviderInvoice(invoiceId: string): ProviderInvoiceResponse {
  const idx = invoices.findIndex((i) => i.id === invoiceId);
  if (idx < 0) notFound("Fatura não encontrada");
  invoices[idx] = { ...invoices[idx], isArchived: true, isActive: false, isOpen: false };
  return invoices[idx];
}

// ——— Background check templates ———

function enrichBackgroundCheckTemplate(template: BackgroundCheckTemplate): BackgroundCheckTemplate {
  const ids = bgcTemplateDataSources[template.id] ?? [];
  let referenceCost = 0;
  let actualCost = 0;
  const linkedDataSources = ids.map((sourceId) => {
    const ds = dataSources.find((item) => item.id === sourceId);
    const reference =
      typeof ds?.referenceCost === "number" ? ds.referenceCost : ds?.defaultCost ?? 0;
    const real =
      typeof ds?.defaultCost === "number"
        ? ds.defaultCost
        : Number.parseFloat(String(ds?.defaultCost ?? reference)) || reference;
    referenceCost += Number(reference) || 0;
    actualCost += Number.isFinite(real) ? real : 0;
    return {
      id: sourceId,
      name: ds?.name ?? sourceId,
      isActive: ds?.isActive ?? true,
    };
  });

  return {
    ...template,
    sourcesCount: ids.length,
    referenceCost: ids.length > 0 ? referenceCost : null,
    actualCost: ids.length > 0 ? actualCost : null,
    linkedDataSources,
  };
}

export function mockListBackgroundCheckTemplates(params?: {
  page?: number;
  limit?: number;
  pageSize?: number;
  search?: string | null;
}) {
  const page = params?.page ?? 1;
  const pageSize = params?.limit ?? params?.pageSize ?? 10;
  let list = bgcTemplates.map(enrichBackgroundCheckTemplate);
  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter((t) => t.name.toLowerCase().includes(q));
  }
  return paginate(list, page, pageSize);
}

export function mockCreateBackgroundCheckTemplate(
  data: import("@/features/background-check-templates/types/background-check-templates.types").CreateBackgroundCheckTemplateRequest,
): BackgroundCheckTemplate {
  const template: BackgroundCheckTemplate = {
    id: newId("bgc"),
    name: data.name,
    description: data.description,
    consultationType: {
      label: data.consultationType,
      value: data.consultationType,
    },
    commercialName: data.commercialName,
    isActive: data.isActive ?? true,
    sourcesCount: 0,
    clientsCount: 0,
  };
  bgcTemplates = [template, ...bgcTemplates];
  bgcTemplateDataSources[template.id] = [];
  return enrichBackgroundCheckTemplate(template);
}

export function mockUpdateBackgroundCheckTemplate(
  id: string,
  data: import("@/features/background-check-templates/types/background-check-templates.types").UpdateBackgroundCheckTemplateRequest,
): BackgroundCheckTemplate {
  const idx = bgcTemplates.findIndex((t) => t.id === id);
  if (idx < 0) notFound("Modelo não encontrado");
  bgcTemplates[idx] = {
    ...bgcTemplates[idx],
    name: data.name,
    description: data.description,
    commercialName: data.commercialName,
    consultationType: { label: data.consultationType, value: data.consultationType },
    hasQsaBackgroundCheck: data.hasQsaBackgroundCheck,
  };
  return enrichBackgroundCheckTemplate(bgcTemplates[idx]);
}

export function mockDeleteBackgroundCheckTemplate(id: string): void {
  bgcTemplates = bgcTemplates.filter((t) => t.id !== id);
  delete bgcTemplateDataSources[id];
}

export function mockGetBackgroundCheckTemplateLinkedClients(
  templateId: string,
  params: ListBundleLinkedClientsParams = {},
) {
  const clients = bgcTemplateLinkedClients[templateId] ?? [];
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 100;
  return paginate(clients, page, pageSize);
}

export function mockGetBackgroundCheckTemplateDataSources(templateId: string) {
  const ids = bgcTemplateDataSources[templateId] ?? [];
  return ids.map((id) => {
    const ds = dataSources.find((d) => d.id === id);
    return {
      value: id,
      label: ds?.name ?? id,
      internalName: ds?.internalName,
      hasQsaBackgroundCheck: ds?.hasQsaBackgroundCheck,
    };
  });
}

export function mockAssignBackgroundCheckTemplateDataSources(
  templateId: string,
  dataSourceIds: string[],
): void {
  bgcTemplateDataSources[templateId] = dataSourceIds;
  const idx = bgcTemplates.findIndex((t) => t.id === templateId);
  if (idx >= 0) {
    bgcTemplates[idx] = enrichBackgroundCheckTemplate({
      ...bgcTemplates[idx],
      sourcesCount: dataSourceIds.length,
    });
  }
}

export function mockGetBackgroundCheckTemplatesByDeductible(
  _deductibleId: string,
): BackgroundCheckTemplate[] {
  return bgcTemplates.slice(0, 1);
}

export function mockAssignBackgroundCheckTemplateToDeductible(): void {
  /* no-op no protótipo */
}

export function mockRemoveBackgroundCheckTemplateFromDeductible(): void {
  /* no-op no protótipo */
}
