import {
  CLIENT_ROW_ACTIONS_MENU,
  INVOICE_STATUS,
  getClientListBillingFranchises,
  type ClientRowMenuEntry,
  type InvoiceStatusKey,
  type MockClient,
  type MockFranchise,
  type MockNfeNote,
} from "./clientesDashboardMockData";
import {
  isClientListBillEligible,
  isClientListCloseToggleEligible,
  useClientListInvoiceStatusStore,
} from "@/features/clients/store/client-list-invoice-status.store";

export const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);

/** LTV mock para listagem de clientes (valores na casa do milhão). */
export function mockClientLtv(client: MockClient): number {
  const profileSeed = client.id.length * 17 + client.fat;
  const millions = 0.95 + (profileSeed % 11) * 0.22 + client.fat / 500_000;
  return Math.round(millions * 1_000_000);
}

export const fmtN = (n: number) => n.toLocaleString("pt-BR");

export const fmtMil = (n: number) =>
  `${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;

export const fc = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export const fmtDetail = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

export const pctDelta = (c: number, p: number) =>
  p === 0 ? (c ? 100 : 0) : ((c - p) / p) * 100;

const PT_COMPETENCE_MONTH: Record<string, number> = {
  jan: 1,
  fev: 2,
  mar: 3,
  abr: 4,
  mai: 5,
  jun: 6,
  jul: 7,
  ago: 8,
  set: 9,
  out: 10,
  nov: 11,
  dez: 12,
};

/** Competência exibida no dashboard mock (`set/2025`). */
export function parseCompetenceMonthYear(label: string): {
  year: number;
  month: number;
} {
  const [monPart, yearPart] = label.trim().toLowerCase().split("/");
  const monthKey = (monPart ?? "set").slice(0, 3);
  const month = PT_COMPETENCE_MONTH[monthKey] ?? 9;
  const year = Number.parseInt(yearPart ?? "", 10) || new Date().getFullYear();
  return { year, month };
}

export function formatMetricVal(key: string, v: number): string {
  if (key === "cl" || key === "ct" || key === "fr") return fmtN(v);
  if (key === "proj") return fmt(v);
  return fmt(v);
}

/** Ex.: `set/2025 - set/2025` → `Ref. set/2025`; intervalo → `Ref. mês/ano - mês/ano`. */
export function formatBillingReferenceInterval(referencia: string): string {
  const trimmed = referencia.trim();
  const parts = trimmed.split(" - ").map((part) => part.trim());
  if (parts.length === 2 && parts[0] === parts[1]) {
    return `Ref. ${parts[0]}`;
  }
  return `Ref. ${trimmed}`;
}

export function nfeCountLabel(n: number): string {
  if (!n) return "—";
  return n === 1 ? "1 nota" : `${n} notas`;
}

function withClientReferencia(
  notes: MockNfeNote[],
  referencia: string,
): MockNfeNote[] {
  return notes.map((note) => ({
    ...note,
    referencia: note.referencia ?? referencia,
  }));
}

function inferNfeNoteProduct(note: MockNfeNote, client: MockClient): string {
  if (note.produto?.trim()) return note.produto.trim();
  const nome = note.nome.toLowerCase();
  const matched = client.produtos.find((produto) => {
    const product = produto.toLowerCase();
    return (
      nome.includes(product) ||
      product.includes(nome) ||
      (product.includes("background") &&
        (nome.includes("bgc") || nome.includes("background"))) ||
      (product.includes("idv") &&
        (nome.includes("idv") || nome.includes("identidade"))) ||
      (product.includes("workflow") && nome.includes("workflow")) ||
      (product.includes("monitor") && nome.includes("monitor")) ||
      (product.includes("api") && nome.includes("api"))
    );
  });
  if (matched) return matched;
  return client.produtos[0] ?? "—";
}

function enrichNfeNotesForClient(
  notes: MockNfeNote[],
  client: MockClient,
): MockNfeNote[] {
  if (notes.length === 0) return notes;
  const amounts = splitClientInvoiceAmount(client.fat, notes.length);
  return notes.map((note, index) => ({
    ...note,
    valor: note.valor ?? amounts[index],
    produto: inferNfeNoteProduct(note, client),
  }));
}

export function clientInvoiceNotes(client: MockClient): MockNfeNote[] {
  let notes: MockNfeNote[];
  if (client.nfe.length > 0) {
    notes = withClientReferencia(client.nfe, client.referencia);
  } else {
    const status = invoiceStatusLabel(client.faturaStatus);
    const fromProdutos = client.produtos.slice(0, 3).map((produto, i) => ({
      tipo: "Franquia" as const,
      nome: produto,
      referencia: client.referencia,
      produto,
      vencimento: client.vencimentoNF,
      statusPagamento: i === 0 ? status : "Pagamento aberto",
    }));
    if (fromProdutos.length > 0) {
      notes = fromProdutos;
    } else {
      notes = [
        {
          tipo: "Franquia",
          nome: "Franquia principal",
          referencia: client.referencia,
          vencimento: client.vencimentoNF,
          statusPagamento: status,
        },
      ];
    }
  }
  return enrichNfeNotesForClient(notes, client);
}

export function clientRowActionsMenu(client: MockClient): ClientRowMenuEntry[] {
  const count = clientInvoiceNotes(client).length;
  const badge = count > 0 ? nfeCountLabel(count) : undefined;
  const billing = useClientListInvoiceStatusStore.getState().getState(client.id);
  const closeToggleLabel =
    billing.status === "fatura_fechada"
      ? "Reabrir conferência"
      : "Aprovar para faturamento";
  const showCloseToggle = isClientListCloseToggleEligible(client.id);
  const showBillClient = isClientListBillEligible(client.id);

  return CLIENT_ROW_ACTIONS_MENU.flatMap((entry) => {
    if (entry.kind === "action" && entry.label === "Ver notas fiscais") {
      return badge ? [{ ...entry, badge }] : [entry];
    }
    if (entry.kind === "action" && entry.label === "Aprovar para faturamento") {
      if (!showCloseToggle) return [];
      return [{ ...entry, label: closeToggleLabel }];
    }
    if (entry.kind === "action" && entry.label === "Faturar cliente") {
      if (!showBillClient) return [];
      return [entry];
    }
    return [entry];
  });
}

export function nfeNoteTitleLabel(note: MockNfeNote): string {
  return `${note.tipo}: ${note.nome}`;
}

export function clientSidebarNotes(client: MockClient): MockNfeNote[] {
  const base = clientInvoiceNotes(client);
  const extras: MockNfeNote[] = [
    {
      tipo: "Franquia",
      nome: "Pacote monitoramento",
      referencia: client.referencia,
      vencimento: client.vencimentoNF,
      statusPagamento: "Pagamento aberto",
    },
    {
      tipo: "Franquia",
      nome: "Consultas API",
      referencia: client.referencia,
      vencimento: client.vencimentoNF,
      statusPagamento: invoiceStatusLabel(client.faturaStatus),
    },
    {
      tipo: "Contrato",
      nome: "Contrato complementar",
      referencia: client.referencia,
      vencimento: client.vencimentoNF,
      statusPagamento: "A conferir",
    },
  ];
  const merged = [...base];
  for (const extra of extras) {
    if (merged.length >= 6) break;
    if (!merged.some((n) => n.nome === extra.nome && n.tipo === extra.tipo)) {
      merged.push(extra);
    }
  }
  return enrichNfeNotesForClient(merged, client);
}

/** Rótulo acessível para radios e leitores de tela. */
export function nfeNoteConsumptionReferenceLabel(note: MockNfeNote): string | null {
  const referencia = note.referencia?.trim();
  if (!referencia) return null;
  return `Ref. ${referencia}`;
}

export function nfeNoteDescription(note: MockNfeNote): string {
  const custom = note.descricao?.trim();
  if (custom) return custom;
  return `Faturamento do período vinculado à ${note.nome}. Emissão na modalidade ${note.tipo}, conforme contrato vigente do cliente.`;
}

export function nfeNoteAriaLabel(note: MockNfeNote): string {
  const parts = [nfeNoteTitleLabel(note)];
  if (note.produto) parts.push(`Produto: ${note.produto}`);
  if (note.valor != null) parts.push(`Valor: ${fmtDetail(note.valor)}`);
  parts.push(`Vencimento: ${note.vencimento}`, nfeNoteDescription(note), note.statusPagamento);
  return parts.join(", ");
}

/** @deprecated Use `NfeNoteStacked` ou `nfeNoteAriaLabel`. */
export function nfeRadioLabel(note: MockNfeNote): string {
  return nfeNoteAriaLabel(note);
}

const FRANCHISE_SOURCES_BY_PRODUCT: Record<string, string[]> = {
  "Background Check": [
    "Receita Federal — CPF",
    "Serasa Experian",
    "Boa Vista SCPC",
  ],
  "ID Validation": ["Serpro — Datavalid", "Único Check", "ID Wall"],
  Monitoramento: ["Lista restritiva OFAC", "Mídias negativas", "Processos judiciais"],
};

/** Fontes da franquia para a sidebar de detalhes (mock). */
export function franchiseMockSources(franchise: MockFranchise): string[] {
  if (franchise.sources?.length) return franchise.sources;
  const byProduct = FRANCHISE_SOURCES_BY_PRODUCT[franchise.product];
  if (byProduct) return byProduct;
  return [`Fonte — ${franchise.product}`, "Fonte complementar"];
}

export function franchiseUserLabel(franchise: MockFranchise): string {
  if (franchise.username && franchise.user !== "—") {
    return `${franchise.user} | ${franchise.username}`;
  }
  return franchise.user;
}

export function franchiseBillingModelTooltipContent(
  franchise: MockFranchise,
): { line1: string; line2: string } {
  const modelName = franchise.billingModelName ?? "Preço fixo";
  const fixed = franchise.billingFixedPrice ?? 1_000;
  const overage = franchise.billingOveragePerQuery ?? 10;
  return {
    line1: `${modelName}: ${fmtDetail(fixed)}`,
    line2: `Excedente: ${fmtDetail(overage)}/consulta`,
  };
}

export function excedenteDestinoLabel(destino: "reembolsado" | "abatido"): string {
  return destino === "reembolsado"
    ? "Excedente reembolsado"
    : "Excedente abatido da próxima fatura";
}

export function invoiceStatusLabel(statusKey: InvoiceStatusKey): string {
  const meta = INVOICE_STATUS[statusKey] ?? {
    label: statusKey,
    chip: "inv-open",
  };
  return meta.label;
}

/** Resolve o status da nota a partir do texto exibido no mock de NF-e. */
export function invoiceStatusKeyFromPaymentLabel(
  paymentLabel: string,
  fallback: InvoiceStatusKey = "faturado_aberto",
): InvoiceStatusKey {
  const normalized = paymentLabel.trim().toLowerCase();
  const entries = Object.entries(INVOICE_STATUS) as [
    InvoiceStatusKey,
    { label: string; chip: string },
  ][];
  for (const [key, meta] of entries) {
    if (meta.label.toLowerCase() === normalized) return key;
  }
  if (normalized.includes("conferir")) return "aberta";
  if (normalized.includes("conferida")) return "fatura_fechada";
  if (normalized.includes("parcial")) return "pago_parcial";
  if (normalized.includes("total")) return "pago_total";
  if (normalized.includes("cancelamento")) return "cancel_solicitado";
  if (normalized.includes("cancelada")) return "nota_cancelada";
  if (normalized.includes("vencida")) return "nota_vencida";
  if (normalized.includes("parcelada") || normalized.includes("parcela")) {
    return "divida_parcelada";
  }
  if (normalized.includes("contábil") || normalized.includes("contabil")) {
    return "baixa_contabil";
  }
  if (normalized.includes("excedente") || normalized.includes("duplic")) {
    return "pago_duplicidade";
  }
  if (normalized.includes("enviada")) return "enviada_faturar";
  if (normalized.includes("aberto") || normalized.includes("aberta")) {
    return "faturado_aberto";
  }
  return fallback;
}

export interface ClientListInvoiceExtraRow {
  name: string;
  amount: number;
  statusKey?: InvoiceStatusKey;
  statusLabel?: string;
}

function splitClientInvoiceAmount(total: number, count: number): number[] {
  if (count <= 1) return [total];
  const weights = Array.from({ length: count }, (_, index) => 1.08 - index * 0.1);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const amounts = weights.map((weight) => Math.round((total * weight) / weightSum));
  amounts[0] += total - amounts.reduce((sum, value) => sum + value, 0);
  return amounts;
}

/** Todas as linhas de fatura por franquia/nota na listagem (mock). */
export function getClientListInvoiceRows(client: MockClient): ClientListInvoiceExtraRow[] {
  if (client.nfe.length > 0) {
    const amounts = splitClientInvoiceAmount(client.fat, client.nfe.length);
    return client.nfe.map((note, index) => ({
      name: note.nome,
      amount: amounts[index],
      statusKey: invoiceStatusKeyFromPaymentLabel(note.statusPagamento),
    }));
  }
  const franchises = getClientListBillingFranchises(client);
  if (franchises.length > 0) {
    return franchises.map((franchise) => ({
      name: franchise.name,
      amount: franchise.valor,
      statusKey: franchise.faturaStatus,
    }));
  }
  const notes = clientInvoiceNotes(client);
  if (notes.length > 0) {
    const amounts = splitClientInvoiceAmount(client.fat, notes.length);
    return notes.map((note, index) => ({
      name: note.nome,
      amount: amounts[index],
      statusKey: invoiceStatusKeyFromPaymentLabel(note.statusPagamento),
    }));
  }
  return [
    {
      name: client.produtos[0] ?? "Franquia principal",
      amount: client.fat,
      statusKey: client.faturaStatus,
    },
  ];
}

/** Demais notas/franquias além da exibida na célula (mock). */
export function getClientListInvoiceExtraRows(
  client: MockClient,
): ClientListInvoiceExtraRow[] {
  const rows = getClientListInvoiceRows(client);
  return rows.length > 1 ? rows.slice(1) : [];
}
