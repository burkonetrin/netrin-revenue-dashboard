import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { formatCurrency } from "@/shared/utils/currency";
import type {
  BillingContractDetail,
  BillingFranchiseLine,
  BillingInvoiceDetail,
  BillingManualInvoice,
  BillingPriceRange,
} from "../types/billing-detail.types";
import type { BillingInvoiceScope } from "../types/billing.types";
import {
  formatBillingCompetence,
  formatBillingDate,
  formatBillingReferencePeriod,
  getBillingDueDateDisplay,
} from "./billing.utils";

/**
 * Define a estrutura de franchise value display.
 */
export interface FranchiseValueDisplay {
  text: string;
  showTooltip: boolean;
}

/**
 * Conteúdo tipado da tooltip de faixas (título + linhas).
 */
export interface PriceRangeTooltipModel {
  title: string;
  lines: string[];
}

/**
 * Define a estrutura de contract header fields.
 */
export interface ContractHeaderFields {
  competence?: string;
  dueDate?: string;
}

/**
 * Define a estrutura de contract total display.
 */
export interface ContractTotalDisplay {
  subtotalLabel: string;
  subtotalAmount: number;
  totalLabel: string;
  totalAmount: number;
  hasAdjustments: boolean;
}

function formatConsultationCount(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "0";
  }

  return value.toLocaleString("pt-BR");
}

function formatConsultationRange(min: number | null | undefined, max: number | null | undefined) {
  const minLabel = formatConsultationCount(min);

  if (max === null || max === undefined || max >= Number.MAX_SAFE_INTEGER / 2) {
    return `${minLabel}+`;
  }

  return `${minLabel}-${formatConsultationCount(max)}`;
}

/**
 * Formata price range tooltip para exibição.
 * @param ranges - ranges
 */
export function formatPriceRangeTooltip(ranges: BillingPriceRange[]) {
  return ranges.map((range) => {
    const min = range.minConsultations ?? 0;
    const max = range.maxConsultations;
    const rangeLabel = formatConsultationRange(min, max);

    if (range.isFixedRange) {
      return `${rangeLabel}: ${formatCurrency(range.unitPrice)}`;
    }

    return `${rangeLabel}: ${formatCurrency(range.unitPrice)}/consulta`;
  });
}

function resolveOverageUnitPrice(
  ranges: BillingPriceRange[],
  excessUnitPrice?: number,
): number | undefined {
  if (excessUnitPrice !== null && excessUnitPrice !== undefined) {
    return excessUnitPrice;
  }

  const overageRange = ranges.find((range) => range.isOverage);
  if (overageRange) {
    return overageRange.unitPrice;
  }

  return undefined;
}

/**
 * Monta título e linhas da tooltip de faixas conforme o modelo de cobrança (CONS-02/03/05).
 */
export function buildPriceRangeTooltipModel(
  franchise: Pick<BillingFranchiseLine, "pricingModel" | "priceRanges" | "excessUnitPrice">,
): PriceRangeTooltipModel | null {
  const ranges = franchise.priceRanges ?? [];
  if (
    ranges.length === 0 &&
    (franchise.excessUnitPrice === null || franchise.excessUnitPrice === undefined)
  ) {
    return null;
  }

  const displayRanges = ranges.filter((range) => !range.isOverage);
  const overageUnitPrice = resolveOverageUnitPrice(ranges, franchise.excessUnitPrice);

  const title =
    franchise.pricingModel === "fixed_with_range_excess"
      ? "Faixas de valor para consumo excedente"
      : "Faixas de valor";

  const lines = formatPriceRangeTooltip(displayRanges);

  if (overageUnitPrice !== null && overageUnitPrice !== undefined && displayRanges.length > 0) {
    const lastMax = displayRanges[displayRanges.length - 1]?.maxConsultations;
    if (lastMax !== null && lastMax !== undefined) {
      lines.push(
        `${formatConsultationCount(lastMax + 1)}+: ${formatCurrency(overageUnitPrice)}/consulta`,
      );
    }
  } else if (
    overageUnitPrice !== null &&
    overageUnitPrice !== undefined &&
    displayRanges.length === 0
  ) {
    // Sem faixas normais, mas há preço de excedente — omitir N+: sem lastMax (edge: não inventar)
  }

  if (lines.length === 0) {
    return null;
  }

  return { title, lines };
}

/**
 * Busca franchise value display na API.
 * @param franchise - franchise
 */
export function getFranchiseValueDisplay(franchise: BillingFranchiseLine): FranchiseValueDisplay {
  switch (franchise.pricingModel) {
    case "fixed":
      return {
        text: formatCurrency(franchise.fixedPrice ?? 0),
        showTooltip: false,
      };
    case "range_per_query":
    case "range_fixed":
      return {
        text: "Faixa de valor",
        showTooltip: true,
      };
    case "fixed_with_range_excess":
      return {
        text: formatCurrency(franchise.fixedPrice ?? 0),
        showTooltip: true,
      };
    default:
      return { text: "-", showTooltip: false };
  }
}

const FRANCHISE_NAME_COLUMN = {
  align: "start" as const,
  headerClassName: "text-left whitespace-nowrap",
  cellClassName: "text-left align-middle w-full",
};

const FRANCHISE_DATA_COLUMN = {
  align: "start" as const,
  headerClassName: "text-left px-3 whitespace-nowrap w-[1%]",
  cellClassName: "text-left px-3 align-middle whitespace-nowrap w-[1%]",
};

const FRANCHISE_SEND_EMAIL_COLUMN = {
  align: "start" as const,
  headerClassName: "text-left pl-3 whitespace-nowrap w-[1%]",
  cellClassName: "pl-3 align-middle whitespace-nowrap w-[1%] text-center",
};

/**
 * Busca franchise table columns na API.
 */
export function getFranchiseTableColumns(
  _scope: BillingInvoiceScope,
): ColumnConfig<BillingFranchiseLine>[] {
  const columns: ColumnConfig<BillingFranchiseLine>[] = [
    { id: "name", label: "Franquia", ...FRANCHISE_NAME_COLUMN },
    { id: "pricingModel", label: "Valor da franquia", ...FRANCHISE_DATA_COLUMN },
    { id: "consumption", label: "Consultas feitas", ...FRANCHISE_DATA_COLUMN },
    { id: "excessAmount", label: "Excedente", ...FRANCHISE_DATA_COLUMN },
    { id: "total", label: "Total", ...FRANCHISE_DATA_COLUMN },
    { id: "sendEmail", label: "Enviar detalhes", ...FRANCHISE_SEND_EMAIL_COLUMN },
  ];

  const totalIndex = columns.findIndex(({ id }) => id === "total");
  columns.splice(totalIndex, 0, {
    id: "dueDate",
    label: "Vencimento",
    ...FRANCHISE_DATA_COLUMN,
  });

  return columns;
}

/**
 * Retorna a quantidade de colunas da tabela de franquias para o scope informado.
 */
export function getFranchiseTableColumnCount(scope: BillingInvoiceScope): number {
  return getFranchiseTableColumns(scope).length;
}

/**
 * Colspan da descrição nas linhas de ajuste (todas as colunas exceto Total e Badge).
 */
export function getAdjustmentRowColSpan(scope: BillingInvoiceScope): number {
  return getFranchiseTableColumnCount(scope) - 2;
}

/**
 * Define a estrutura de manual invoice partition.
 */
export interface ManualInvoicePartition {
  aboveGlobal: BillingManualInvoice[];
  belowGlobal: BillingManualInvoice[];
  byContractId: Map<string, BillingManualInvoice[]>;
}

/**
 * Define a estrutura de manual invoice table placement.
 */
export type ManualInvoiceTablePlacement = "above" | "below" | "contract";

/**
 * Define a estrutura de manual invoice table columns config.
 */
export interface ManualInvoiceTableColumnsConfig {
  showCompetence: boolean;
  showDueDate: boolean;
}

/**
 * Define quais colunas extras a tabela de projetos/setups exibe.
 * - deductible: competência + vencimento
 * - below: notas separadas (pós-contratos) — vencimento em qualquer scope
 * - above / contract: manuais integrados — vencimento
 */
export function getManualInvoiceTableColumnsConfig(
  scope: BillingInvoiceScope,
  placement: ManualInvoiceTablePlacement,
  _options?: { hasSeparateNote?: boolean },
): ManualInvoiceTableColumnsConfig {
  if (scope === "deductible") {
    return { showCompetence: true, showDueDate: true };
  }

  if (placement === "below") {
    return { showCompetence: false, showDueDate: true };
  }

  if (placement === "above") {
    return { showCompetence: false, showDueDate: true };
  }

  if (scope === "contract" && placement === "contract") {
    return { showCompetence: false, showDueDate: true };
  }

  return { showCompetence: false, showDueDate: false };
}

const MANUAL_INVOICE_NAME_COLUMN = {
  align: "start" as const,
  headerClassName: "text-left",
  cellClassName: "text-left align-top w-full",
};

const MANUAL_INVOICE_DATA_COLUMN = {
  align: "end" as const,
  headerClassName: "text-right px-3 whitespace-nowrap w-[1%]",
  cellClassName: "text-right px-3 align-top whitespace-nowrap w-[1%]",
};

/**
 * Texto da coluna Descrição: "Produto - descrição" (omite partes vazias).
 */
export function formatManualInvoiceDescriptionLabel(
  invoice: Pick<BillingManualInvoice, "productName" | "description">,
): string {
  const product = invoice.productName?.trim() ?? "";
  const description = invoice.description?.trim() ?? "";

  if (product && description) return `${product} - ${description}`;
  return product || description;
}

/**
 * Monta as colunas da tabela de faturas manuais no detalhe.
 */
export function getManualInvoiceTableColumns(
  scope: BillingInvoiceScope,
  placement: ManualInvoiceTablePlacement,
  options?: { hasSeparateNote?: boolean },
): ColumnConfig<BillingManualInvoice>[] {
  const { showCompetence, showDueDate } = getManualInvoiceTableColumnsConfig(
    scope,
    placement,
    options,
  );

  const columns: ColumnConfig<BillingManualInvoice>[] = [
    { id: "description", label: "Descrição", ...MANUAL_INVOICE_NAME_COLUMN },
  ];

  if (showCompetence) {
    columns.push({
      id: "competence",
      label: "Competência",
      ...MANUAL_INVOICE_DATA_COLUMN,
    });
  }

  if (showDueDate) {
    columns.push({
      id: "dueDate",
      label: "Vencimento",
      ...MANUAL_INVOICE_DATA_COLUMN,
    });
  }

  columns.push({
    id: "value",
    label: "Total",
    ...MANUAL_INVOICE_DATA_COLUMN,
  });

  return columns;
}

/**
 * Particiona manual invoices em grupos de exibição.
 * - aboveGlobal: manuais integrados globais (pré-contratos)
 * - belowGlobal: notas separadas / órfãs / deductible (pós-contratos)
 * - byContractId: manuais integrados aninhados no contrato
 */
export function partitionManualInvoices(
  scope: BillingInvoiceScope,
  manuals: BillingManualInvoice[],
): ManualInvoicePartition {
  const aboveGlobal: BillingManualInvoice[] = [];
  const belowGlobal: BillingManualInvoice[] = [];
  const byContractId = new Map<string, BillingManualInvoice[]>();

  for (const manual of manuals) {
    if (manual.separateNote) {
      belowGlobal.push(manual);
      continue;
    }

    if (scope === "client") {
      aboveGlobal.push(manual);
      continue;
    }

    if (scope === "contract") {
      // Órfãs sem contractId ficam com as notas separadas (após os contratos).
      if (!manual.contractId) {
        belowGlobal.push(manual);
        continue;
      }

      const current = byContractId.get(manual.contractId) ?? [];
      current.push(manual);
      byContractId.set(manual.contractId, current);
      continue;
    }

    // deductible: seção global pós-contratos
    belowGlobal.push(manual);
  }

  return { aboveGlobal, belowGlobal, byContractId };
}

/**
 * Indica se o contrato possui valor mínimo configurado (> 0).
 */
export function hasContractMinimumValue(contract: BillingContractDetail): boolean {
  return contract.minimumValue !== undefined && contract.minimumValue > 0;
}

/**
 * Busca contract header fields na API.
 */
export function getContractHeaderFields(
  scope: BillingInvoiceScope,
  contract: BillingContractDetail,
  _invoice: BillingInvoiceDetail,
): ContractHeaderFields {
  if (scope === "client" && !hasContractMinimumValue(contract)) {
    return {};
  }

  if (scope === "contract" || hasContractMinimumValue(contract)) {
    return {
      competence: formatContractPeriodLabel(contract.competence, _invoice),
      dueDate: contract.dueDate ? formatBillingDate(contract.dueDate) : undefined,
    };
  }

  return {
    competence: formatContractPeriodLabel(contract.competence, _invoice),
  };
}

function formatContractPeriodLabel(
  contractCompetence: string | undefined,
  invoice: BillingInvoiceDetail,
): string | undefined {
  if (!contractCompetence && !invoice.referenceMonth) return undefined;

  if (invoice.invoicePeriodMonths > 1) {
    return formatBillingReferencePeriod(
      invoice.referenceMonth || contractCompetence || invoice.competence,
      invoice.invoicePeriodMonths,
    );
  }

  return contractCompetence ? formatBillingCompetence(contractCompetence) : undefined;
}

function hasMinimumValueContract(invoice: BillingInvoiceDetail): boolean {
  return invoice.contracts.some(hasContractMinimumValue);
}

/** Campos de metadados globais (competência/vencimento) do detalhe da fatura. */
export function getInvoiceMetadataFields(invoice: BillingInvoiceDetail) {
  const { scope, notes } = invoice.invoiceDetails;
  const [firstNote] = notes;
  const competenceLabel = invoice.competence
    ? formatBillingCompetence(invoice.competence)
    : undefined;

  if (scope === "client" && !hasMinimumValueContract(invoice)) {
    return {
      showGlobalMetadata: true,
      competence: competenceLabel,
      dueDate: getBillingDueDateDisplay(firstNote?.dueDate, { source: invoice.source }),
    };
  }

  return {
    showGlobalMetadata: false,
    competence: undefined,
    dueDate: undefined,
  };
}

/**
 * Busca contract total display na API.
 * @param contract - contract
 */
export function getContractTotalDisplay(contract: BillingContractDetail): ContractTotalDisplay {
  const hasAdjustments = Boolean(contract.adjustments?.length);

  return {
    hasAdjustments,
    subtotalLabel: "Sem descontos/acréscimos",
    subtotalAmount: contract.subtotalWithoutAdjustments,
    totalLabel: "Total do contrato",
    totalAmount: contract.total,
  };
}

/**
 * Formata franchise excess para exibição em texto único (ex.: testes / fallback).
 * A célula de UI usa `excessLabel` + `excessSublabel` em duas linhas.
 */
export function formatFranchiseExcess(franchise: BillingFranchiseLine) {
  if (franchise.excessLabel && franchise.excessSublabel) {
    return `${franchise.excessLabel} - ${franchise.excessSublabel}`;
  }

  if (franchise.excessLabel) {
    return franchise.excessLabel;
  }

  if (franchise.excessSublabel) {
    return franchise.excessSublabel;
  }

  return formatCurrency(franchise.excessAmount);
}
