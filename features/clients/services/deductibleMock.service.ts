import { CONTRACTS_MOCK, type MockFranchise } from "@/clientesDashboardMockData";
import type {
  BillingModelOption,
  DetailedDeductibleResponse,
  DeductibleResponse,
  PaginatedDeductiblesResponse,
} from "../types/deductibles.types";
import type { PaymentInfoResponse } from "../types/contractsFranchises.types";

function parseVigenciaToIsoRange(vigencia: string): { beginningTerm: string; endTerm: string } {
  const parts = vigencia.split(" - ").map((p) => p.trim());
  const toIso = (br: string) => {
    const [d, m, y] = br.split("/");
    if (!d || !m || !y) return "2026-01-01";
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  };
  return {
    beginningTerm: toIso(parts[0] ?? "01/01/2026"),
    endTerm: toIso(parts[1] ?? "31/12/2026"),
  };
}

function isBgcFranchise(franchise: MockFranchise) {
  const haystack = `${franchise.name} ${franchise.product}`.toLowerCase();
  return haystack.includes("bgc") || haystack.includes("background check");
}

const deductibleActiveOverrides = new Map<string, boolean>();

function deductibleActiveKey(contractId: string, franchiseId: string) {
  return `${contractId}:${franchiseId}`;
}

/** Persiste ativo/inativo da franquia no protótipo (memória da sessão). */
export function setDeductibleActiveState(
  contractId: string,
  franchiseId: string,
  isActive: boolean,
): void {
  deductibleActiveOverrides.set(deductibleActiveKey(contractId, franchiseId), isActive);
}

function resolveFranchiseIsActive(
  contractId: string,
  franchiseId: string,
  defaultActive: boolean,
): boolean {
  const key = deductibleActiveKey(contractId, franchiseId);
  if (deductibleActiveOverrides.has(key)) {
    return deductibleActiveOverrides.get(key) ?? defaultActive;
  }
  return defaultActive;
}

function mapFranchiseToDetailed(
  contractId: string,
  franchise: MockFranchise,
): DetailedDeductibleResponse {
  const { beginningTerm, endTerm } = parseVigenciaToIsoRange(franchise.vigencia);
  const isTest = franchise.tipo.toLowerCase().includes("teste");
  const isFixedPrice = (franchise.billingModelName ?? "").toLowerCase().includes("fixo");
  const now = "2026-03-01T12:00:00.000Z";

  const billingModelValue = isFixedPrice ? "fixed_price" : "price_range";

  const detailed: DetailedDeductibleResponse = {
    id: franchise.id,
    contractId,
    name: franchise.name,
    description: franchise.product,
    isTest,
    testPeriodMonths: isTest ? 3 : null,
    beginningTerm,
    endTerm,
    automaticRenovation: franchise.renAuto.toLowerCase().startsWith("s"),
    proofExpiration: 30,
    billingModel: {
      label: franchise.billingModelName ?? "Preço fixo",
      value: billingModelValue,
      requiredBillingModels: isFixedPrice ? ["fixedPrice"] : ["priceRanges"],
    },
    automaticBlocking: false,
    isActive: resolveFranchiseIsActive(contractId, franchise.id, franchise.ativo),
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    excessUnitPrice: franchise.billingOveragePerQuery ?? null,
    products: [
      {
        id: `prod-${franchise.id}`,
        name: franchise.product,
        internalName: franchise.product.replace(/\s+/g, "_").toUpperCase(),
        serviceType: {
          id: "st-1",
          name: "Consulta",
          internalName: "CONSULTA",
        },
      },
    ],
    hideBillingModel: false,
    hideDataSourcesStep: false,
    hideTestFlag: false,
    hideAutomaticRenovation: false,
    hideProfitCenter: false,
  };

  if (isFixedPrice && franchise.billingFixedPrice != null) {
    detailed.fixedPrice = {
      id: `fp-${franchise.id}`,
      includedConsultations: franchise.consLim || 5000,
      packagePrice: franchise.billingFixedPrice,
      createdAt: now,
      updatedAt: now,
    };
  }

  if (!isFixedPrice) {
    detailed.priceRanges = [
      {
        id: `pr-${franchise.id}-1`,
        minConsultations: 0,
        maxConsultations: franchise.consLim || 5000,
        unitPrice: franchise.billingOveragePerQuery ?? 1.5,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  if (!isBgcFranchise(franchise)) {
    detailed.dataSources = [
      {
        id: "ds-mock-1",
        name: "Receita Federal — CNPJ",
      },
    ];
    detailed.dataSourceBundles = [
      {
        id: "bundle-mock-1",
        name: "Pacote cadastral",
      },
    ];
  }

  return detailed;
}

function findFranchise(contractId: string, franchiseId: string) {
  const contract = CONTRACTS_MOCK.find((row) => row.id === contractId);
  const franchise = contract?.franchises.find((row) => row.id === franchiseId);
  if (!contract || !franchise) return null;
  return { contract, franchise };
}

export async function getDeductibleById(
  contractId: string,
  deductibleId: string,
): Promise<DetailedDeductibleResponse> {
  const found = findFranchise(contractId, deductibleId);
  if (!found) {
    throw new Error("Franquia não encontrada");
  }
  return mapFranchiseToDetailed(found.contract.id, found.franchise);
}

export async function listDeductiblesByContract(
  contractId: string,
): Promise<PaginatedDeductiblesResponse> {
  const contract = CONTRACTS_MOCK.find((row) => row.id === contractId);
  const data = (contract?.franchises ?? []).map((franchise) =>
    mapFranchiseToDetailed(contractId, franchise),
  ) as DeductibleResponse[];

  return {
    data,
    pagination: {
      page: 1,
      pageSize: 100,
      totalPages: 1,
      totalRecords: data.length,
      hasNext: false,
      hasPrevious: false,
    },
  };
}

export async function getDeductibleProfitCenterMock(
  _clientId: string,
  _contractId: string,
  franchiseId: string,
) {
  return {
    profitCenter: {
      value: "f0a8a218-08c8-44a3-a2b7-4e3b690651bd",
      label: "NL10801001 - Projetos: Junior Duraes - NL10801001",
    },
    overageProfitCenter: {
      value: "d4e5f6a7-08c8-44a3-a2b7-4e3b690651bd",
      label: "NL10801002 - Consumo: Junior Duraes - NL10801002",
    },
    deductibleId: franchiseId,
  };
}

export async function getDeductiblePaymentInfoMock(
  _clientId: string,
  _contractId: string,
  _franchiseId: string,
): Promise<PaymentInfoResponse | null> {
  const now = "2026-03-01T12:00:00.000Z";
  return {
    id: "pi-mock-franchise",
    currency: { label: "Real", value: "BRL" },
    dueType: { label: "Padrão", value: "standard" },
    paymentArrangement: { label: "Pós-pago", value: "postpaid" },
    paymentMethod: { label: "Boleto", value: "boleto" },
    dueAdditionalDays: 10,
    billingPeriodicity: "monthly",
    nfeAddConsumptionInfo: false,
    nfeAddBankInfo: false,
    nfeAddOrderObservation: false,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getDeductibleLinkedSourcesMock(franchiseId: string) {
  const contract = CONTRACTS_MOCK.find((row) =>
    row.franchises.some((franchise) => franchise.id === franchiseId),
  );
  const franchise = contract?.franchises.find((row) => row.id === franchiseId);
  if (!franchise || isBgcFranchise(franchise)) {
    return { bundles: [], individualSources: [] };
  }

  const now = "2026-03-01T12:00:00.000Z";
  return {
    bundles: [
      {
        id: "bundle-mock-1",
        name: "Pacote cadastral",
        description: "Fontes cadastrais padrão",
        isActive: true,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
    individualSources: [
      {
        id: "ds-mock-1",
        name: "Receita Federal — CNPJ",
        description: "Consulta cadastral",
        internalName: "RF_CNPJ",
        isActive: true,
      },
    ],
  };
}

export const MOCK_BILLING_MODELS: BillingModelOption[] = [
  {
    label: "Preço fixo",
    value: "fixed_price",
    requiredBillingModels: ["fixedPrice"],
  },
  {
    label: "Faixa de valores",
    value: "price_range",
    requiredBillingModels: ["priceRanges"],
  },
];
