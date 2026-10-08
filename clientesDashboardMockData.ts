export type ClientHealthKey = "sucesso" | "warning" | "danger" | "oportunidade";

export type InvoiceStatusKey =
  | "aberta"
  | "fatura_fechada"
  | "enviada_faturar"
  | "faturado_aberto"
  | "pago_parcial"
  | "pago_total"
  | "cancel_solicitado"
  | "nota_cancelada"
  | "pago_duplicidade"
  | "nota_vencida"
  | "divida_parcelada"
  | "baixa_contabil";

export interface MockNfeNote {
  tipo: string;
  nome: string;
  vencimento: string;
  statusPagamento: string;
}

export interface MockParcelaAtrasada {
  numero: number;
  valor: number;
  /** Competência no formato mês/ano. */
  competencia: string;
}

export interface MockClient {
  id: string;
  nome: string;
  cnpj: string;
  inicio: string;
  ativo: boolean;
  prod: number;
  produtos: string[];
  referencia: string;
  fat: number;
  cons: number;
  usado: number;
  lim: number;
  s: ClientHealthKey;
  vencimentoNF: string;
  faturaStatus: InvoiceStatusKey;
  /** Valor já pago quando `faturaStatus` é `pago_parcial`. */
  valorPagoParcial?: number;
  /** Parcelas em atraso (badge dívida parcelada). */
  parcelasAtrasadas?: MockParcelaAtrasada[];
  /** Valor de pagamento não identificado (fluxo de vinculação). */
  pagamentoNaoIdentificadoValor?: number;
  /** Pagamento excedente vinculado a NF (fluxo de consulta). */
  pagamentoExcedente?: {
    valor: number;
    notaDescricao: string;
    destino: "reembolsado" | "abatido";
  };
  nfe: MockNfeNote[];
  /** Exibe banner de pagamento pendente (aba Informações de pagamento). */
  pendingPaymentInfo?: boolean;
}

export interface MockFranchise {
  id: string;
  name: string;
  product: string;
  ativo: boolean;
  faturaStatus: InvoiceStatusKey;
  valorPagoParcial?: number;
  centro: string;
  excLabel: string;
  vigencia: string;
  periodo: string;
  valorLabel: string | null;
  valor: number;
  mrr: number;
  consUsed: number;
  consLim: number;
  consVal: number;
  consMes: number;
  consMesVal: number;
  excQ: number;
  excVal: number;
  totalPeriodo: number;
  total12q: number;
  total12v: number;
  user: string;
  /** Login exibido ao lado do nome no menu ⋯. */
  username?: string;
  tipo: string;
  status: string;
  renAuto: string;
  /** Modelo de cobrança (tooltip na coluna Valor). */
  billingModelName?: string;
  billingFixedPrice?: number;
  billingOveragePerQuery?: number;
}

export interface MockContract {
  id: string;
  name: string;
  ativo: boolean;
  imposto: string;
  faturado: number;
  faturaStatus: InvoiceStatusKey;
  valorPagoParcial?: number;
  vigencia: string;
  renovacao: boolean;
  minimo: number | null;
  media: number;
  total12: number;
  mrr: number;
  cons: number;
  franchises: MockFranchise[];
}

export interface MockKpi {
  l: string;
  c: number;
  p: number;
  ico: "trend" | "wallet";
}

export interface MockDiscountBreakdownLine {
  kind: "Franquia" | "Contrato";
  name: string;
  value: number;
}

export interface MockFranchiseTotal12Line {
  name: string;
  value: number;
  consultas: number;
}

export interface MockDetailKpi {
  l: string;
  c: number;
  pct?: boolean;
  chip?: string;
  discountSaldoRemanescente?: number;
  discountBreakdown?: MockDiscountBreakdownLine[];
  total12FranchiseBreakdown?: MockFranchiseTotal12Line[];
}

export interface EvoPointReal {
  total: number;
  acv: number;
  spot: number;
  exc: number;
  desc: number;
  mrr: number;
  cl: number;
  ct: number;
  fr: number;
  projTotal?: number;
}

export interface EvoPointProj {
  projTotal: number;
  cl: number;
  ct: number;
  fr: number;
}

export type EvoPoint = EvoPointReal | EvoPointProj;

export interface LegendItem {
  id: string;
  l: string;
  c: string;
  type: "line" | "dash" | "bar";
}

export interface BarRow {
  l: string;
  v: number;
  p: number;
}

export interface HealthBarRow {
  title: string;
  sub: string;
  v: number;
  p: number;
}

export interface CohortRow {
  label: string;
  n: number;
  r: Record<number, number>;
  m: Record<number, number>;
}

export const DETAIL_CONTEXT = "__detail__";
export const LIST_COLSPAN = 9;

export const INVOICE_STATUS: Record<
  InvoiceStatusKey,
  { label: string; chip: string }
> = {
  aberta: { label: "Fatura aberta", chip: "inv-open" },
  fatura_fechada: { label: "Fatura fechada", chip: "inv-closed" },
  enviada_faturar: { label: "Enviada para faturar", chip: "inv-sent" },
  faturado_aberto: {
    label: "Pagamento em aberto",
    chip: "inv-due",
  },
  pago_parcial: { label: "Pago parcial", chip: "inv-partial" },
  pago_total: { label: "Pago totalmente", chip: "inv-paid" },
  cancel_solicitado: {
    label: "Solicitado cancelamento",
    chip: "inv-cancel-req",
  },
  nota_cancelada: { label: "Nota cancelada", chip: "inv-cancelled" },
  pago_duplicidade: { label: "Pago excedente", chip: "inv-duplicate" },
  nota_vencida: { label: "Nota vencida", chip: "inv-overdue" },
  divida_parcelada: { label: "Dívida parcelada", chip: "inv-installment" },
  baixa_contabil: { label: "Baixa contábil", chip: "inv-writeoff" },
};

/** Ordem exibida na sidebar de filtros e na vitrine de badges na listagem. */
export const INVOICE_STATUS_ORDER: InvoiceStatusKey[] = [
  "aberta",
  "fatura_fechada",
  "enviada_faturar",
  "faturado_aberto",
  "pago_parcial",
  "pago_total",
  "cancel_solicitado",
  "nota_cancelada",
  "pago_duplicidade",
  "nota_vencida",
  "divida_parcelada",
  "baixa_contabil",
];

export type ClientRowMenuEntry =
  | { kind: "action"; label: string; badge?: string }
  | { kind: "divider" }
  | { kind: "heading"; label: string };

export const CLIENT_ROW_ACTIONS_MENU: ClientRowMenuEntry[] = [
  { kind: "action", label: "Encaminhar consumo por e-mail" },
  { kind: "action", label: "Gerar histórico de consultas" },
  { kind: "divider" },
  { kind: "heading", label: "Faturamento" },
  { kind: "action", label: "Adicionar fatura" },
  { kind: "action", label: "Ajustar fatura" },
  { kind: "action", label: "Fechar fatura" },
  { kind: "action", label: "Faturar cliente" },
  { kind: "divider" },
  { kind: "heading", label: "Nota fiscal" },
  { kind: "action", label: "Ver notas fiscais" },
  { kind: "action", label: "Vincular pagamento não identificado" },
  { kind: "action", label: "Ver pagamento excedente" },
  { kind: "action", label: "Baixa contábil" },
  { kind: "action", label: "Cancelar nota" },
];

/** @deprecated Use `CLIENT_ROW_ACTIONS_MENU`. */
export const CLIENT_ROW_ACTIONS_PRIMARY: string[] = [];

/** @deprecated Use `CLIENT_ROW_ACTIONS_MENU`. */
export const CLIENT_ROW_ACTIONS_SECONDARY: string[] = [];

/** @deprecated Use PRIMARY + SECONDARY no menu de ações. */
export const CLIENT_ROW_ACTIONS = [
  ...CLIENT_ROW_ACTIONS_PRIMARY,
  ...CLIENT_ROW_ACTIONS_SECONDARY,
];

export const INVOICE_STATUS_FILTER_OPTIONS = INVOICE_STATUS_ORDER.map(
  (key) => ({
    key,
    label: INVOICE_STATUS[key].label,
  }),
);

export const MOCK_COMPETENCE_MONTHS = [
  { key: "2025-01", label: "jan/2025" },
  { key: "2025-02", label: "fev/2025" },
  { key: "2025-03", label: "mar/2025" },
  { key: "2025-04", label: "abr/2025" },
  { key: "2025-05", label: "mai/2025" },
  { key: "2025-06", label: "jun/2025" },
  { key: "2025-07", label: "jul/2025" },
  { key: "2025-08", label: "ago/2025" },
  { key: "2025-09", label: "set/2025" },
  { key: "2025-10", label: "out/2025" },
  { key: "2025-11", label: "nov/2025" },
  { key: "2025-12", label: "dez/2025" },
  { key: "2026-01", label: "jan/2026" },
  { key: "2026-02", label: "fev/2026" },
  { key: "2026-03", label: "mar/2026" },
];

export const KPIS: MockKpi[] = [
  { l: "Total faturado", c: 312333, p: 298400, ico: "trend" },
  { l: "ACV", c: 245800, p: 238200, ico: "trend" },
  { l: "Spot", c: 66533, p: 60200, ico: "wallet" },
  { l: "Excedente", c: 442960, p: 410500, ico: "trend" },
  { l: "MRR", c: 203000, p: 198500, ico: "trend" },
  { l: "Descontos", c: 189840, p: 195200, ico: "wallet" },
  { l: "Total últimos 12 meses", c: 3164000, p: 3020000, ico: "wallet" },
  { l: "Média últimos 3 meses", c: 312333, p: 298400, ico: "trend" },
];

export const EVO_LABELS = [
  "10/2025",
  "11/2025",
  "12/2025",
  "01/2026",
  "02/2026",
  "03/2026",
  "04/2026",
  "05/2026",
  "06/2026",
  "07/2026",
  "08/2026",
  "09/2026",
  "10/2026",
  "11/2026",
  "12/2026",
];

export const LAST_REAL = 11;

export const EVO: EvoPoint[] = [
  {
    total: 261e3,
    acv: 198e3,
    spot: 58e3,
    exc: 35e3,
    desc: 12e3,
    mrr: 162e3,
    cl: 118,
    ct: 178,
    fr: 132,
  },
  {
    total: 268e3,
    acv: 202e3,
    spot: 60e3,
    exc: 36e3,
    desc: 12500,
    mrr: 165e3,
    cl: 120,
    ct: 182,
    fr: 135,
  },
  {
    total: 275e3,
    acv: 206e3,
    spot: 62e3,
    exc: 37e3,
    desc: 13e3,
    mrr: 168e3,
    cl: 122,
    ct: 185,
    fr: 138,
  },
  {
    total: 272e3,
    acv: 204e3,
    spot: 61e3,
    exc: 36500,
    desc: 13200,
    mrr: 167e3,
    cl: 121,
    ct: 184,
    fr: 137,
  },
  {
    total: 278e3,
    acv: 208e3,
    spot: 63e3,
    exc: 38e3,
    desc: 12800,
    mrr: 170e3,
    cl: 123,
    ct: 186,
    fr: 139,
  },
  {
    total: 285e3,
    acv: 212e3,
    spot: 65e3,
    exc: 39e3,
    desc: 13500,
    mrr: 172e3,
    cl: 124,
    ct: 188,
    fr: 141,
  },
  {
    total: 290e3,
    acv: 215e3,
    spot: 66e3,
    exc: 40e3,
    desc: 14e3,
    mrr: 175e3,
    cl: 125,
    ct: 190,
    fr: 142,
  },
  {
    total: 288e3,
    acv: 213e3,
    spot: 65e3,
    exc: 39500,
    desc: 14200,
    mrr: 174e3,
    cl: 125,
    ct: 189,
    fr: 142,
  },
  {
    total: 295e3,
    acv: 218e3,
    spot: 67e3,
    exc: 41e3,
    desc: 14500,
    mrr: 178e3,
    cl: 126,
    ct: 192,
    fr: 144,
  },
  {
    total: 302e3,
    acv: 222e3,
    spot: 69e3,
    exc: 42e3,
    desc: 15e3,
    mrr: 181e3,
    cl: 127,
    ct: 194,
    fr: 146,
  },
  {
    total: 308e3,
    acv: 226e3,
    spot: 70e3,
    exc: 43e3,
    desc: 15200,
    mrr: 184e3,
    cl: 128,
    ct: 196,
    fr: 148,
  },
  {
    total: 312333,
    acv: 245800,
    spot: 66533,
    exc: 442960 / 12,
    desc: 15820,
    mrr: 203e3,
    cl: 128,
    ct: 214,
    fr: 386,
  },
  { projTotal: 318e3, cl: 0, ct: 0, fr: 0 },
  { projTotal: 325e3, cl: 0, ct: 0, fr: 0 },
  { projTotal: 332e3, cl: 0, ct: 0, fr: 0 },
];

export const LEGEND: LegendItem[] = [
  { id: "total", l: "Total faturado", c: "#652cdd", type: "line" },
  { id: "acv", l: "ACV", c: "#2563eb", type: "line" },
  { id: "spot", l: "Spot", c: "#0891b2", type: "line" },
  { id: "exc", l: "Excedente", c: "#ea580c", type: "line" },
  { id: "mrr", l: "MRR", c: "#7c3aed", type: "line" },
  { id: "desc", l: "Descontos", c: "#dc2626", type: "line" },
  { id: "proj", l: "Projeção", c: "#ef4444", type: "dash" },
  { id: "cl", l: "Clientes ativos", c: "#652cdd", type: "bar" },
  { id: "ct", l: "Contratos ativos", c: "#8456e4", type: "bar" },
  { id: "fr", l: "Franquias ativas", c: "#22c55e", type: "bar" },
];

const CLIENT_PROFILES_BY_STATUS: Record<
  InvoiceStatusKey,
  Omit<MockClient, "faturaStatus">
> = {
  aberta: {
    id: "fenix",
    nome: "Fênix Tecnologia e Pagamentos",
    cnpj: "67.890.123/0001-45",
    inicio: "01/04/2023",
    ativo: true,
    prod: 1,
    produtos: ["Background Check"],
    referencia: "set/2025 - set/2025",
    fat: 98700,
    cons: 131,
    usado: 9825,
    lim: 7500,
    s: "oportunidade",
    vencimentoNF: "01/04/2026",
    nfe: [],
  },
  fatura_fechada: {
    id: "orion-fechada",
    nome: "Orion Pagamentos (fatura fechada)",
    cnpj: "89.012.345/0001-67",
    inicio: "10/08/2024",
    ativo: true,
    prod: 2,
    produtos: ["Background Check", "API"],
    referencia: "set/2025 - set/2025",
    fat: 74200,
    cons: 88,
    usado: 6600,
    lim: 7500,
    s: "sucesso",
    vencimentoNF: "10/08/2026",
    nfe: [],
  },
  enviada_faturar: {
    id: "cerrado",
    nome: "Cerrado Agro Participações",
    cnpj: "34.567.890/0001-12",
    inicio: "20/11/2017",
    ativo: true,
    prod: 2,
    produtos: ["Background Check", "IDV"],
    referencia: "set/2025 - set/2025",
    fat: 158200,
    cons: 74,
    usado: 8880,
    lim: 12e3,
    s: "warning",
    vencimentoNF: "20/11/2026",
    nfe: [],
  },
  faturado_aberto: {
    id: "alpha",
    nome: "Alpha Serviços Financeiros LTDA",
    cnpj: "12.345.678/0001-90",
    inicio: "12/12/2026",
    ativo: true,
    pendingPaymentInfo: true,
    prod: 5,
    produtos: [
      "Background Check",
      "IDV",
      "Workflow",
      "API",
      "Monitoramento",
    ],
    referencia: "jul/2025 - set/2025",
    fat: 284e3,
    cons: 112,
    usado: 22400,
    lim: 2e4,
    s: "oportunidade",
    vencimentoNF: "12/12/2026",
    nfe: [
      {
        tipo: "Franquia",
        nome: "Franquia de BGC",
        vencimento: "12/12/2026",
        statusPagamento: "Pagamento em aberto",
      },
      {
        tipo: "Franquia",
        nome: "Franquia de IDV",
        vencimento: "15/01/2027",
        statusPagamento: "Pagamento em aberto",
      },
      {
        tipo: "Franquia",
        nome: "Workflow enterprise",
        vencimento: "20/01/2027",
        statusPagamento: "Fatura aberta",
      },
    ],
  },
  pago_parcial: {
    id: "estrela",
    nome: "Estrela Varejo Digital ME",
    cnpj: "56.789.012/0001-34",
    inicio: "18/09/2020",
    ativo: true,
    prod: 4,
    produtos: ["IDV", "Monitoramento", "Workflow", "API"],
    referencia: "jul/2025 - ago/2025",
    fat: 121400,
    cons: 88,
    usado: 7920,
    lim: 9e3,
    s: "warning",
    vencimentoNF: "18/09/2026",
    valorPagoParcial: 72_840,
    nfe: [
      {
        tipo: "Franquia",
        nome: "Pacote IDV",
        vencimento: "18/09/2026",
        statusPagamento: "Pago parcial",
      },
      {
        tipo: "Franquia",
        nome: "Monitoramento lojas",
        vencimento: "25/09/2026",
        statusPagamento: "Pagamento em aberto",
      },
      {
        tipo: "Contrato",
        nome: "CONTRATO varejo 2025",
        vencimento: "30/09/2026",
        statusPagamento: "Pago parcial",
      },
    ],
  },
  pago_total: {
    id: "boreal",
    nome: "Boreal Logística S.A.",
    cnpj: "23.456.789/0001-01",
    inicio: "05/08/2021",
    ativo: true,
    prod: 3,
    produtos: ["Workflow", "API", "Monitoramento"],
    referencia: "ago/2025 - set/2025",
    fat: 196500,
    cons: 96,
    usado: 14400,
    lim: 15e3,
    s: "sucesso",
    vencimentoNF: "05/10/2026",
    nfe: [
      {
        tipo: "Franquia",
        nome: "Workflow corporativo",
        vencimento: "05/10/2026",
        statusPagamento: "Pago totalmente",
      },
    ],
  },
  cancel_solicitado: {
    id: "horizonte",
    nome: "Horizonte Saúde Operadora",
    cnpj: "89.012.345/0001-67",
    inicio: "15/06/2019",
    ativo: false,
    prod: 3,
    produtos: ["Monitoramento", "Workflow", "API"],
    referencia: "jun/2025 - set/2025",
    fat: 76100,
    cons: 99,
    usado: 4950,
    lim: 5e3,
    s: "sucesso",
    vencimentoNF: "15/06/2026",
    nfe: [
      {
        tipo: "Franquia",
        nome: "Monitoramento corporativo",
        vencimento: "15/06/2026",
        statusPagamento: "Solicitado cancelamento",
      },
      {
        tipo: "Franquia",
        nome: "Workflow API",
        vencimento: "20/06/2026",
        statusPagamento: "Solicitado cancelamento",
      },
      {
        tipo: "Contrato",
        nome: "CONTRATO saúde 2026",
        vencimento: "30/06/2026",
        statusPagamento: "Solicitado cancelamento",
      },
    ],
  },
  nota_cancelada: {
    id: "delta",
    nome: "Delta Seguros Corretora",
    cnpj: "45.678.901/0001-23",
    inicio: "03/02/2022",
    ativo: false,
    prod: 3,
    produtos: ["Background Check", "Workflow", "API"],
    referencia: "jan/2025 - dez/2025",
    fat: 142900,
    cons: 43,
    usado: 4300,
    lim: 1e4,
    s: "danger",
    vencimentoNF: "—",
    nfe: [],
  },
  pago_duplicidade: {
    id: "guara",
    nome: "Guará Indústria de Alimentos",
    cnpj: "78.901.234/0001-56",
    inicio: "10/05/2018",
    ativo: true,
    prod: 2,
    produtos: ["Background Check", "IDV"],
    referencia: "ago/2025 - set/2025",
    fat: 87300,
    cons: 61,
    usado: 3660,
    lim: 6e3,
    s: "warning",
    vencimentoNF: "10/09/2026",
    pagamentoNaoIdentificadoValor: 4_520,
    pagamentoExcedente: {
      valor: 3_280,
      notaDescricao: "Background Check",
      destino: "abatido",
    },
    nfe: [
      {
        tipo: "Franquia",
        nome: "Background Check",
        vencimento: "10/09/2026",
        statusPagamento: "Pago excedente",
      },
      {
        tipo: "Franquia",
        nome: "ID Validation",
        vencimento: "10/10/2026",
        statusPagamento: "Pagamento em aberto",
      },
      {
        tipo: "Contrato",
        nome: "CONTRATO Guará 2025",
        vencimento: "15/09/2026",
        statusPagamento: "Pago totalmente",
      },
    ],
  },
  nota_vencida: {
    id: "ipe",
    nome: "Ipê Construções LTDA",
    cnpj: "90.123.456/0001-78",
    inicio: "22/01/2020",
    ativo: true,
    prod: 1,
    produtos: ["Workflow"],
    referencia: "set/2025 - set/2025",
    fat: 64800,
    cons: 38,
    usado: 1520,
    lim: 4e3,
    s: "danger",
    vencimentoNF: "05/08/2026",
    nfe: [
      {
        tipo: "Contrato",
        nome: "Obra corporativa",
        vencimento: "05/08/2026",
        statusPagamento: "Nota vencida",
      },
      {
        tipo: "Franquia",
        nome: "Workflow canteiro",
        vencimento: "10/08/2026",
        statusPagamento: "Nota vencida",
      },
      {
        tipo: "Franquia",
        nome: "Consultas avulsas",
        vencimento: "15/08/2026",
        statusPagamento: "Pagamento em aberto",
      },
    ],
  },
  divida_parcelada: {
    id: "jurema",
    nome: "Jurema Educação S.A.",
    cnpj: "01.234.567/0001-89",
    inicio: "14/03/2021",
    ativo: true,
    prod: 2,
    produtos: ["API", "Monitoramento"],
    referencia: "jul/2025 - set/2025",
    fat: 52300,
    cons: 105,
    usado: 3150,
    lim: 3e3,
    s: "oportunidade",
    vencimentoNF: "14/09/2026",
    parcelasAtrasadas: [
      { numero: 1, valor: 18_500, competencia: "jul/2025" },
      { numero: 2, valor: 18_500, competencia: "ago/2025" },
      { numero: 3, valor: 9_200, competencia: "set/2025" },
    ],
    nfe: [],
  },
  baixa_contabil: {
    id: "estacao",
    nome: "Estação Data Hub LTDA",
    cnpj: "11.222.333/0001-44",
    inicio: "07/11/2016",
    ativo: false,
    prod: 1,
    produtos: ["Background Check"],
    referencia: "jan/2025 - set/2025",
    fat: 41200,
    cons: 0,
    usado: 0,
    lim: 5e3,
    s: "danger",
    vencimentoNF: "—",
    nfe: [
      {
        tipo: "Franquia",
        nome: "Background Check corporativo",
        vencimento: "30/08/2026",
        statusPagamento: "Baixa contábil",
      },
      {
        tipo: "Franquia",
        nome: "Pacote consultas avulsas",
        vencimento: "15/09/2026",
        statusPagamento: "Baixa contábil",
      },
      {
        tipo: "Contrato",
        nome: "CONTRATO data hub",
        vencimento: "01/09/2026",
        statusPagamento: "Baixa contábil",
      },
    ],
  },
};

export const CLIENTS: MockClient[] = INVOICE_STATUS_ORDER.map((statusKey) => ({
  ...CLIENT_PROFILES_BY_STATUS[statusKey],
  faturaStatus: statusKey,
}));

export const DETAIL_KPIS: MockDetailKpi[] = [
  { l: "Média últimos 3 meses", c: 1e6 },
  {
    l: "Total últimos 12 meses",
    c: 1e6,
    total12FranchiseBreakdown: [
      { name: "Franquia de BGC", value: 1e6, consultas: 1e6 },
      { name: "Franquia de IDV", value: 1e6, consultas: 1e6 },
    ],
  },
  { l: "MRR", c: 1e6 },
  { l: "Excedente", c: 140e3 },
  {
    l: "Descontos",
    c: 60e3,
    discountSaldoRemanescente: 14_500,
    discountBreakdown: [
      { kind: "Franquia", name: "Franquia de IDV", value: 35e3 },
      { kind: "Contrato", name: "CONTRATO 01", value: 25e3 },
    ],
  },
];

export const CONTRACTS_MOCK: MockContract[] = [
  {
    id: "c1",
    name: "CONTRATO 01",
    ativo: true,
    imposto: "Líquido",
    faturado: 1e6,
    faturaStatus: "faturado_aberto",
    vigencia: "01/01/2026 - 31/12/2026",
    renovacao: true,
    minimo: null,
    media: 1e6,
    total12: 1e6,
    mrr: 1e6,
    cons: 68,
    franchises: [
      {
        id: "f1",
        name: "Franquia de BGC",
        product: "Background Check",
        ativo: true,
        faturaStatus: "pago_total",
        centro: "ACV - Junior Duraes",
        excLabel: "Excedente: ACV Junior Duraes",
        vigencia: "01/01/2026 - 31/12/2026",
        periodo: "Período 3 meses",
        valorLabel: null,
        valor: 1e6,
        mrr: 1e6,
        consUsed: 321,
        consLim: 5000,
        consVal: 1e3,
        consMes: 128,
        consMesVal: 640,
        excQ: 1000,
        excVal: 1e3,
        totalPeriodo: 1e3,
        total12q: 1e6,
        total12v: 1e6,
        user: "João da Silva",
        username: "joao.silva",
        tipo: "Franquia de teste",
        status: "Ativa",
        renAuto: "Não",
        billingModelName: "Preço fixo",
        billingFixedPrice: 1_000,
        billingOveragePerQuery: 10,
      },
      {
        id: "f2",
        name: "Franquia de IDV",
        product: "ID Validation",
        ativo: true,
        faturaStatus: "faturado_aberto",
        centro: "ACV - Junior Duraes",
        excLabel: "Excedente: ACV Junior Duraes",
        vigencia: "01/01/2026 - 31/12/2026",
        periodo: "Período 12 meses",
        valorLabel: null,
        valor: 1e6,
        mrr: 1e6,
        consUsed: 321,
        consLim: 5000,
        consVal: 1e3,
        consMes: 128,
        consMesVal: 640,
        excQ: 1000,
        excVal: 1e3,
        totalPeriodo: 1e3,
        total12q: 1e6,
        total12v: 1e6,
        user: "João da Silva",
        username: "joao.silva",
        tipo: "Franquia de teste",
        status: "Ativa",
        renAuto: "Não",
        billingModelName: "Preço fixo",
        billingFixedPrice: 1_000,
        billingOveragePerQuery: 10,
      },
      {
        id: "f3",
        name: "Franquia encerrada",
        product: "Monitoramento",
        ativo: false,
        faturaStatus: "nota_cancelada",
        centro: "ACV - Junior Duraes",
        excLabel: "Excedente: ACV Junior Duraes",
        vigencia: "01/01/2025 - 31/12/2025",
        periodo: "Período 12 meses",
        valorLabel: null,
        valor: 500e3,
        mrr: 0,
        consUsed: 0,
        consLim: 1000,
        consVal: 0,
        consMes: 0,
        consMesVal: 0,
        excQ: 0,
        excVal: 0,
        totalPeriodo: 0,
        total12q: 1200,
        total12v: 48e3,
        user: "—",
        tipo: "Franquia padrão",
        status: "Inativa",
        renAuto: "Não",
      },
    ],
  },
  {
    id: "c2",
    name: "CONTRATO 02",
    ativo: true,
    imposto: "Bruto",
    faturado: 850e3,
    faturaStatus: "pago_parcial",
    valorPagoParcial: 425_000,
    vigencia: "01/01/2026 - 31/12/2026",
    renovacao: true,
    minimo: 1e6,
    media: 1e6,
    total12: 1e6,
    mrr: 1e6,
    cons: 68,
    franchises: [],
  },
  {
    id: "c3",
    name: "CONTRATO 03 (inativo)",
    ativo: false,
    imposto: "Líquido",
    faturado: 0,
    faturaStatus: "aberta",
    vigencia: "01/01/2024 - 31/12/2024",
    renovacao: false,
    minimo: 1e6,
    media: 0,
    total12: 0,
    mrr: 0,
    cons: 0,
    franchises: [],
  },
];

export const SL: Record<ClientHealthKey, string> = {
  sucesso: "Sucesso",
  warning: "Risco médio",
  danger: "Risco alto",
  oportunidade: "Oportunidade",
};

export const SC: Record<ClientHealthKey, string> = {
  sucesso: "success",
  warning: "warning",
  danger: "danger",
  oportunidade: "secondary",
};

export const BAR_PROD: BarRow[] = [
  { l: "Background Check", v: 1.35e6, p: 1.28e6 },
  { l: "IDV", v: 980e3, p: 920e3 },
  { l: "Monitoramento", v: 720e3, p: 690e3 },
  { l: "Workflow", v: 540e3, p: 510e3 },
  { l: "API", v: 410e3, p: 430e3 },
];

export const BAR_CTR: BarRow[] = [
  { l: "Juliana", v: 1.12e6, p: 1.05e6 },
  { l: "Matheus", v: 890e3, p: 860e3 },
  { l: "Junior Duraes", v: 760e3, p: 780e3 },
  { l: "Maria Luiza", v: 650e3, p: 620e3 },
];

export const BAR_HEALTH: HealthBarRow[] = [
  { title: "Risco médio", sub: "entre 51% a 90%", v: 3, p: 2 },
  { title: "Oportunidade", sub: "maior que 100%", v: 2, p: 2 },
  { title: "Risco alto", sub: "igual ou menor a 50%", v: 1, p: 2 },
  { title: "Sucesso", sub: "entre 91% a 100%", v: 2, p: 1 },
].sort((a, b) => b.v - a.v);

export const COHORT_OFFSETS = [0, 1, 2, 3, 6, 9, 12, 18, 24, 30, 31];

export const COHORT: CohortRow[] = [
  { label: "out/24", n: 4, r: { 0: 100, 1: 100, 2: 100, 3: 100, 6: 100, 9: 75 }, m: { 0: 5700, 9: 4275 } },
  { label: "set/24", n: 4, r: { 0: 100, 1: 100, 6: 100, 18: 100 }, m: { 0: 5700, 18: 28300 } },
  { label: "mai/24", n: 4, r: { 0: 100, 3: 80, 18: 80 }, m: { 0: 5700, 3: 4560 } },
  { label: "Base jan/24", n: 44, r: { 0: 100, 31: 100 }, m: { 0: 236200, 31: 236200 } },
];

export const CONTRACT_ACTIONS = [
  "Novo contrato",
  "Filtrar consumo por data",
  "Exibir contratos e franquias inativos",
  "Exportar consumo para CSV",
  "Atualizar consumo",
];

export const DETAIL_PILL_TABS = [
  "Sobre",
  "Contratos",
  "Usuários",
  "Contatos do cliente",
  "Faturas",
  "Informações de pagamento",
];

export type ClientDetailTabKey =
  | "sobre"
  | "contratos"
  | "usuarios"
  | "contatos"
  | "faturas"
  | "informacoes-pagamento";

export const CLIENT_DETAIL_TABS: { key: ClientDetailTabKey; title: string }[] =
  [
    { key: "sobre", title: "Sobre" },
    { key: "contratos", title: "Contratos" },
    { key: "usuarios", title: "Usuários" },
    { key: "contatos", title: "Contatos do cliente" },
    { key: "faturas", title: "Faturas" },
    { key: "informacoes-pagamento", title: "Informações de pagamento" },
  ];

export interface MockClientUserRow {
  id: string;
  fullName: string;
  email: string;
  username: string;
  token?: string;
  isActive: boolean;
}

export interface MockClientContactRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  contactType: string;
}

export interface MockClientInvoiceRow {
  id: string;
  referenceLabel: string;
  competence: string;
  dueDate: string;
  totalAmount: number;
}

export const MOCK_CLIENT_USERS: MockClientUserRow[] = [
  {
    id: "u1",
    fullName: "João da Silva",
    email: "joao.silva@empresa.com.br",
    username: "joao.silva",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token-joao",
    isActive: true,
  },
  {
    id: "u2",
    fullName: "Maria Souza",
    email: "maria.souza@empresa.com.br",
    username: "maria.souza",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token-maria",
    isActive: true,
  },
  {
    id: "u3",
    fullName: "Carlos Mendes",
    email: "carlos.mendes@empresa.com.br",
    username: "carlos.mendes",
    isActive: false,
  },
];

export const MOCK_CLIENT_CONTACTS: MockClientContactRow[] = [
  {
    id: "ct1",
    name: "Ana Paula",
    email: "ana.paula@empresa.com.br",
    phone: "11987654321",
    contactType: "Financeiro",
  },
  {
    id: "ct2",
    name: "Roberto Lima",
    email: "roberto.lima@empresa.com.br",
    phone: "21976543210",
    contactType: "Comercial",
  },
];

export const MOCK_CLIENT_INVOICES: MockClientInvoiceRow[] = [
  {
    id: "inv1",
    referenceLabel: "set/2025 · Período 3 meses",
    competence: "set/2025",
    dueDate: "10/10/2025",
    totalAmount: 284_000,
  },
  {
    id: "inv2",
    referenceLabel: "ago/2025 · Período 3 meses",
    competence: "ago/2025",
    dueDate: "10/09/2025",
    totalAmount: 196_500,
  },
  {
    id: "inv3",
    referenceLabel: "jul/2025 · Período 3 meses",
    competence: "jul/2025",
    dueDate: "10/08/2025",
    totalAmount: 121_400,
  },
];

export function isEvoReal(point: EvoPoint): point is EvoPointReal {
  return "total" in point && point.total !== undefined;
}

export function initialLegendVisibility(): Record<string, boolean> {
  return Object.fromEntries(LEGEND.map((x) => [x.id, true]));
}
