import type { KpiSnapshot } from "./types";

export const COHORT_OFFSETS = [0, 1, 2, 3, 6, 9, 12, 18, 24, 30, 31] as const;

export type CohortOffset = (typeof COHORT_OFFSETS)[number];

export interface CohortRowMock {
  /** Chave yyyy-mm para ordenação */
  key: string;
  label: string;
  initialClients: number;
  /** Por offset M → retenção % ou MRR em reais; null = futuro */
  retention: Partial<Record<CohortOffset, number>>;
  mrr: Partial<Record<CohortOffset, number>>;
}

/** Mais recente primeiro (topo da tabela). */
export const COHORT_ROWS: CohortRowMock[] = [
  {
    key: "2024-10",
    label: "out/24",
    initialClients: 4,
    retention: { 0: 100, 1: 100, 2: 100, 3: 100, 6: 100, 9: 75 },
    mrr: {
      0: 5_700,
      1: 5_700,
      2: 5_700,
      3: 5_700,
      6: 5_700,
      9: 4_275,
    },
  },
  {
    key: "2024-09",
    label: "set/24",
    initialClients: 4,
    retention: {
      0: 100,
      1: 100,
      2: 100,
      3: 100,
      6: 100,
      9: 100,
      12: 100,
      18: 100,
    },
    mrr: {
      0: 5_700,
      1: 5_700,
      2: 5_700,
      3: 5_700,
      6: 5_700,
      9: 5_700,
      12: 5_700,
      18: 28_300,
    },
  },
  {
    key: "2024-08",
    label: "ago/24",
    initialClients: 4,
    retention: {
      0: 100,
      1: 100,
      2: 100,
      3: 100,
      6: 100,
      9: 100,
      12: 100,
      18: 100,
    },
    mrr: {
      0: 5_700,
      1: 5_700,
      2: 5_700,
      3: 5_700,
      6: 5_700,
      9: 5_700,
      12: 5_700,
      18: 5_700,
    },
  },
  {
    key: "2024-07",
    label: "jul/24",
    initialClients: 4,
    retention: {
      0: 100,
      1: 100,
      2: 100,
      3: 100,
      6: 100,
      9: 100,
      12: 100,
      18: 100,
    },
    mrr: {
      0: 5_700,
      1: 5_700,
      2: 5_700,
      3: 5_700,
      6: 5_700,
      9: 5_700,
      12: 5_700,
      18: 5_700,
    },
  },
  {
    key: "2024-06",
    label: "jun/24",
    initialClients: 4,
    retention: {
      0: 100,
      1: 100,
      2: 100,
      3: 100,
      6: 100,
      9: 100,
      12: 100,
      18: 100,
    },
    mrr: {
      0: 5_700,
      1: 5_700,
      2: 5_700,
      3: 5_700,
      6: 5_700,
      9: 5_700,
      12: 5_700,
      18: 5_700,
    },
  },
  {
    key: "2024-05",
    label: "mai/24",
    initialClients: 4,
    retention: {
      0: 100,
      1: 100,
      2: 100,
      3: 80,
      6: 80,
      9: 80,
      12: 80,
      18: 80,
    },
    mrr: {
      0: 5_700,
      1: 5_700,
      2: 5_700,
      3: 4_560,
      6: 4_560,
      9: 4_560,
      12: 4_560,
      18: 4_560,
    },
  },
  {
    key: "2024-04",
    label: "abr/24",
    initialClients: 4,
    retention: {
      0: 100,
      1: 100,
      2: 100,
      3: 100,
      6: 100,
      9: 100,
      12: 100,
      18: 100,
    },
    mrr: {
      0: 5_700,
      1: 5_700,
      2: 5_700,
      3: 5_700,
      6: 5_700,
      9: 5_700,
      12: 5_700,
      18: 5_700,
    },
  },
  {
    key: "2024-03",
    label: "mar/24",
    initialClients: 4,
    retention: {
      0: 100,
      1: 100,
      2: 100,
      3: 100,
      6: 100,
      9: 100,
      12: 100,
      18: 100,
    },
    mrr: {
      0: 5_700,
      1: 5_700,
      2: 5_700,
      3: 5_700,
      6: 5_700,
      9: 5_700,
      12: 5_700,
      18: 5_700,
    },
  },
  {
    key: "2024-02",
    label: "fev/24",
    initialClients: 4,
    retention: {
      0: 100,
      1: 100,
      2: 100,
      3: 100,
      6: 100,
      9: 100,
      12: 100,
      18: 100,
    },
    mrr: {
      0: 5_700,
      1: 5_700,
      2: 5_700,
      3: 5_700,
      6: 5_700,
      9: 5_700,
      12: 5_700,
      18: 5_700,
    },
  },
  {
    key: "2024-01",
    label: "Base jan/24",
    initialClients: 44,
    retention: {
      0: 100,
      1: 100,
      2: 100,
      3: 100,
      6: 100,
      9: 100,
      12: 100,
      18: 100,
      24: 100,
      30: 100,
      31: 100,
    },
    mrr: {
      0: 236_200,
      1: 236_200,
      2: 236_200,
      3: 236_200,
      6: 236_200,
      9: 236_200,
      12: 236_200,
      18: 236_200,
      24: 236_200,
      30: 236_200,
      31: 236_200,
    },
  },
];

export const CLIENTS_PAGE_KPIS: Record<
  | "totalFaturado"
  | "acv"
  | "spot"
  | "total12m"
  | "excedente"
  | "descontos"
  | "acrescimos"
  | "mrr"
  | "consumoMedio",
  KpiSnapshot
> = {
  totalFaturado: { current: 312_333, previous: 298_400 },
  acv: { current: 245_800, previous: 238_200 },
  spot: { current: 66_533, previous: 60_200 },
  total12m: { current: 3_164_000, previous: 3_020_000 },
  excedente: { current: 442_960, previous: 410_500 },
  descontos: { current: 189_840, previous: 195_200 },
  acrescimos: { current: 94_920, previous: 88_100 },
  mrr: { current: 203_000, previous: 198_500 },
  consumoMedio: { current: 112, previous: 108, isPercent: true },
};

export interface MonthlyEvolutionPoint {
  month: string;
  totalFaturado: number;
  acv: number;
  spot: number;
  excedente: number;
  acrescimo: number;
  desconto: number;
  mrr: number;
  franquiasAtivas: number;
  contratosAtivos: number;
  clientesAtivos: number;
}

export const MONTHLY_EVOLUTION: MonthlyEvolutionPoint[] = [
  {
    month: "Jan",
    totalFaturado: 280_000,
    acv: 218_000,
    spot: 62_000,
    excedente: 38_000,
    acrescimo: 8_200,
    desconto: 14_500,
    mrr: 185_000,
    franquiasAtivas: 340,
    contratosAtivos: 198,
    clientesAtivos: 118,
  },
  {
    month: "Fev",
    totalFaturado: 292_000,
    acv: 226_500,
    spot: 65_500,
    excedente: 41_200,
    acrescimo: 8_800,
    desconto: 15_100,
    mrr: 188_500,
    franquiasAtivas: 348,
    contratosAtivos: 202,
    clientesAtivos: 120,
  },
  {
    month: "Mar",
    totalFaturado: 305_000,
    acv: 234_000,
    spot: 71_000,
    excedente: 43_800,
    acrescimo: 9_100,
    desconto: 16_200,
    mrr: 192_000,
    franquiasAtivas: 355,
    contratosAtivos: 206,
    clientesAtivos: 122,
  },
  {
    month: "Abr",
    totalFaturado: 298_400,
    acv: 229_800,
    spot: 68_600,
    excedente: 42_100,
    acrescimo: 8_900,
    desconto: 17_800,
    mrr: 190_500,
    franquiasAtivas: 358,
    contratosAtivos: 208,
    clientesAtivos: 123,
  },
  {
    month: "Mai",
    totalFaturado: 310_500,
    acv: 238_200,
    spot: 72_300,
    excedente: 44_500,
    acrescimo: 9_400,
    desconto: 16_900,
    mrr: 195_800,
    franquiasAtivas: 362,
    contratosAtivos: 210,
    clientesAtivos: 124,
  },
  {
    month: "Jun",
    totalFaturado: 318_200,
    acv: 242_600,
    spot: 75_600,
    excedente: 46_200,
    acrescimo: 9_800,
    desconto: 18_400,
    mrr: 198_200,
    franquiasAtivas: 368,
    contratosAtivos: 212,
    clientesAtivos: 125,
  },
  {
    month: "Jul",
    totalFaturado: 325_800,
    acv: 248_900,
    spot: 76_900,
    excedente: 47_800,
    acrescimo: 10_200,
    desconto: 19_100,
    mrr: 200_400,
    franquiasAtivas: 372,
    contratosAtivos: 214,
    clientesAtivos: 126,
  },
  {
    month: "Ago",
    totalFaturado: 308_600,
    acv: 236_400,
    spot: 72_200,
    excedente: 45_900,
    acrescimo: 9_600,
    desconto: 20_500,
    mrr: 199_100,
    franquiasAtivas: 375,
    contratosAtivos: 215,
    clientesAtivos: 127,
  },
  {
    month: "Set",
    totalFaturado: 312_333,
    acv: 245_800,
    spot: 66_533,
    excedente: 36_913,
    acrescimo: 7_910,
    desconto: 15_820,
    mrr: 203_000,
    franquiasAtivas: 386,
    contratosAtivos: 214,
    clientesAtivos: 128,
  },
];
