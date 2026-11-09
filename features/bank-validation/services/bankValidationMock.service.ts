import type {
  BankValidationMetric,
  BankValidationTransactionQualityResponse,
  BankValidationVolumetryParams,
  BankValidationVolumetryResponse,
} from "../types/bank-validation.types";

const SOURCES = [
  { key: "stark", label: "Stark" },
  { key: "trio", label: "Trio" },
] as const;

function metric(
  label: string,
  total: number,
  bySource: Record<string, number> = { stark: Math.round(total * 0.4), trio: Math.round(total * 0.6) },
  codes: BankValidationMetric["codes"] = [],
): BankValidationMetric {
  return { label, codes, total, bySource };
}

function volumetryMetrics(referenceMonth: string): BankValidationVolumetryResponse {
  return {
    referenceMonth,
    sources: [...SOURCES],
    metrics: {
      totalRequests: metric("Total de requisições", 1_245_800),
      billable: metric("Bilhetadas", 1_198_420, undefined, [
        {
          statusCode: 200,
          description: "Entregue com sucesso",
          category: "Netrin",
        },
        {
          statusCode: 609,
          description: "Parâmetro(s) inválido(s)",
          category: "Processada",
        },
        {
          statusCode: 626,
          description: "Chave pix não pertencente ao documento de referência",
          category: "Processada",
        },
      ]),
      exceededDeductible: metric("Franquia excedida", 12_430),
      dailyLimit: metric("Limite diário", 8_210),
      clientErrorLimit: metric("Limite erro cliente", 4_120),
      timeouts: metric("Timeouts", 9_870),
      serviceUnavailable: metric("Serviço indisponível", 3_450),
      netrinFailures: metric("Falhas Netrin", 2_180),
      bankFailures: metric("Falhas Bancárias", 1_940),
      blacklistCpf: metric("Blacklist CPF", 620),
      failureRate: metric("Taxa de falhas", 0.0033, { stark: 0.0028, trio: 0.0036 }),
    },
  };
}

function transactionQualityMetrics(referenceMonth: string): BankValidationTransactionQualityResponse {
  return {
    referenceMonth,
    sources: [...SOURCES],
    metrics: {
      totalRequests: metric("Total de requisições", 176),
      billable: metric("Bilhetadas", 173, { stark: 88, trio: 85 }, [
        {
          statusCode: 626,
          description: "Chave pix não pertencente ao documento de referência",
          category: "Processada",
        },
        {
          statusCode: 200,
          description: "Entregue com sucesso",
          category: "Netrin",
        },
        {
          statusCode: 609,
          description: "Parâmetro(s) inválido(s)",
          category: "Processada",
        },
      ]),
      completedRequests: metric("Requisições Efetivadas (200)", 171, { stark: 86, trio: 85 }),
      invalidParams: metric("Parâmetros inválidos (609)", 2, { stark: 1, trio: 1 }),
      keyNotBelongs: metric("Chave não pertence (626)", 0),
      validAccounts: metric("Contas válidas", 124, { stark: 62, trio: 62 }),
      invalidAccounts: metric("Contas inválidas", 47, { stark: 24, trio: 23 }),
      avgTime: metric("Tempo médio (s)", 9.25, { stark: 8.1, trio: 9.25 }),
      invalidParamsBillableRatio: metric("Taxa parâmetros inválidos / bilhetadas", 0.0116),
      keyNotBelongsBillableRatio: metric("Taxa chave não pertence / bilhetadas", 0),
      completedRequestsBillableRatio: metric("Taxa entregues / bilhetadas", 0.9884),
      validAccountsCompletedRatio: metric("Taxa contas válidas / entregues", 0.7251),
      invalidAccountsCompletedRatio: metric("Taxa contas inválidas / entregues", 0.2749),
    },
  };
}

/** Simula latência de rede do protótipo. */
function delay(ms = 280): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function getBankValidationVolumetryMock(
  params: BankValidationVolumetryParams,
): Promise<BankValidationVolumetryResponse> {
  await delay();
  return volumetryMetrics(params.referenceMonth);
}

export async function getBankValidationTransactionQualityMock(
  params: BankValidationVolumetryParams,
): Promise<BankValidationTransactionQualityResponse> {
  await delay();
  return transactionQualityMetrics(params.referenceMonth);
}
