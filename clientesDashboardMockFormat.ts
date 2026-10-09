import {
  CLIENT_ROW_ACTIONS_MENU,
  INVOICE_STATUS,
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

export function clientInvoiceNotes(client: MockClient): MockNfeNote[] {
  if (client.nfe.length > 0) return client.nfe;
  const status = invoiceStatusLabel(client.faturaStatus);
  const fromProdutos = client.produtos.slice(0, 3).map((produto, i) => ({
    tipo: "Franquia" as const,
    nome: produto,
    vencimento: client.vencimentoNF,
    statusPagamento: i === 0 ? status : "Pagamento aberto",
  }));
  if (fromProdutos.length > 0) return fromProdutos;
  return [
    {
      tipo: "Franquia",
      nome: "Franquia principal",
      vencimento: client.vencimentoNF,
      statusPagamento: status,
    },
  ];
}

export function clientRowActionsMenu(client: MockClient): ClientRowMenuEntry[] {
  const count = clientInvoiceNotes(client).length;
  const badge = count > 0 ? nfeCountLabel(count) : undefined;
  const billing = useClientListInvoiceStatusStore.getState().getState(client.id);
  const closeToggleLabel =
    billing.status === "fatura_fechada" ? "Reabrir fatura" : "Fechar fatura";
  const showCloseToggle = isClientListCloseToggleEligible(client.id);
  const showBillClient = isClientListBillEligible(client.id);

  return CLIENT_ROW_ACTIONS_MENU.flatMap((entry) => {
    if (entry.kind === "action" && entry.label === "Ver notas fiscais") {
      return badge ? [{ ...entry, badge }] : [entry];
    }
    if (entry.kind === "action" && entry.label === "Fechar fatura") {
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
      vencimento: client.vencimentoNF,
      statusPagamento: "Pagamento aberto",
    },
    {
      tipo: "Franquia",
      nome: "Consultas API",
      vencimento: client.vencimentoNF,
      statusPagamento: invoiceStatusLabel(client.faturaStatus),
    },
    {
      tipo: "Contrato",
      nome: "Contrato complementar",
      vencimento: client.vencimentoNF,
      statusPagamento: "Fatura aberta",
    },
  ];
  const merged = [...base];
  for (const extra of extras) {
    if (merged.length >= 6) break;
    if (!merged.some((n) => n.nome === extra.nome && n.tipo === extra.tipo)) {
      merged.push(extra);
    }
  }
  return merged;
}

/** Rótulo acessível para radios e leitores de tela. */
export function nfeNoteAriaLabel(note: MockNfeNote): string {
  return `${nfeNoteTitleLabel(note)}, Vencimento: ${note.vencimento}, ${note.statusPagamento}`;
}

/** @deprecated Use `NfeNoteStacked` ou `nfeNoteAriaLabel`. */
export function nfeRadioLabel(note: MockNfeNote): string {
  return nfeNoteAriaLabel(note);
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
