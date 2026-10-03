// @ts-nocheck
import { formatCurrency } from "@/shared/utils/currency";
import type {
  ApiBillingEntryAdjustmentResponse,
  ApiBillingEntryItemResponse,
  ApiBillingEntryResponse,
  ApiInvoiceAdjustmentResponse,
  ApiInvoiceItemResponse,
  ApiInvoiceResponse,
  ApiMonthValue,
  ApiNfeMetadataItem,
  ApiPricingRange,
} from "../types/billing-api.types";
import type {
  BillingContractDetail,
  BillingFranchiseConsumption,
  BillingFranchiseLine,
  BillingFranchisePricingModel,
  BillingInvoiceAdjustment,
  BillingInvoiceDetail,
  BillingInvoiceMode,
  BillingManualInvoice,
  BillingPriceRange,
} from "../types/billing-detail.types";
import type { BillingInvoiceScope } from "../types/billing.types";
import type { BillingPaymentContext } from "./billing-payment-context.mapper";
import {
  mapBillingEntryToRecord,
  mapInvoiceToRecord,
  mapMonthRefToCompetence,
  mapNfeUnificationLevel,
  parseApiDecimal,
} from "./billing-api.mapper";
import { formatContractAdjustmentDescription } from "./billing-adjustment.utils";

type ApiBillingItem = ApiInvoiceItemResponse | ApiBillingEntryItemResponse;

type ApiMonetaryAdjustmentResponse =
  | ApiInvoiceAdjustmentResponse
  | ApiBillingEntryAdjustmentResponse;

/** Tipo de competência do contrato no espelho, derivado dos itens. */
export type ContractCompetenceType = "minimum" | "excess_only" | "standard";

/** Lê `minimumApplied` do item; ausente (invoice) trata como `"0.00"`. */
export function parseMinimumApplied(item: ApiBillingItem): number {
  const raw =
    "minimumApplied" in item &&
    item.minimumApplied !== null &&
    item.minimumApplied !== undefined &&
    item.minimumApplied !== ""
      ? item.minimumApplied
      : "0.00";
  return parseApiDecimal(raw);
}

/**
 * Classifica a competência do contrato a partir dos itens da entry/invoice.
 * - minimum: algum item com minimumApplied > 0 e isOverage === false
 * - excess_only: todos os itens isOverage === true e minimumApplied ≤ 0
 * - standard: demais casos (incl. lista vazia)
 */
export function resolveContractCompetenceType(
  contractItems: ApiBillingItem[],
): ContractCompetenceType {
  const hasMinimumBillingItem = contractItems.some(
    (item) => item.isOverage === false && parseMinimumApplied(item) > 0,
  );
  if (hasMinimumBillingItem) {
    return "minimum";
  }

  const allOverageWithZeroMinimum =
    contractItems.length > 0 &&
    contractItems.every((item) => item.isOverage === true && parseMinimumApplied(item) <= 0);

  if (allOverageWithZeroMinimum) {
    return "excess_only";
  }

  return "standard";
}

function formatConsultationCount(value: number) {
  return value.toLocaleString("pt-BR");
}

function mapApiBillingModelToPricingModel(
  billingModel: string | null | undefined,
): BillingFranchisePricingModel {
  switch (billingModel) {
    case "price_range":
      return "range_per_query";
    case "fixed_price_range":
      return "range_fixed";
    case "overage_on_price_range":
      return "fixed_with_range_excess";
    default:
      return "fixed";
  }
}

function normalizeApiPricingRange(range: ApiPricingRange): ApiPricingRange {
  return {
    minConsultations: range.minConsultations ?? range.min_consultations ?? 0,
    maxConsultations: range.maxConsultations ?? range.max_consultations ?? null,
    unitPrice: range.unitPrice ?? range.unit_price ?? "0",
    isOverage: range.isOverage ?? range.is_overage ?? false,
  };
}

function mapApiPricingRanges(
  ranges: ApiPricingRange[] | null | undefined,
  pricingModel: BillingFranchisePricingModel,
): BillingPriceRange[] | undefined {
  if (!ranges?.length) return undefined;

  const normalizedRanges = ranges.map(normalizeApiPricingRange);

  // REQ-1: modelos só-faixa não distinguem faixa de overage — manter todas.
  // fixed_with_range_excess: snapshot pode ainda trazer isOverage; manter todas.
  const filteredRanges =
    pricingModel === "fixed"
      ? normalizedRanges.filter((range) => !range.isOverage)
      : normalizedRanges;

  return filteredRanges.map((range) => ({
    minConsultations: range.minConsultations ?? 0,
    maxConsultations: range.maxConsultations ?? null,
    unitPrice: parseApiDecimal(range.unitPrice),
    isFixedRange: pricingModel === "range_fixed",
    isOverage: range.isOverage ?? false,
  }));
}

function getNormalRanges(ranges: ApiPricingRange[]): ApiPricingRange[] {
  return ranges.map(normalizeApiPricingRange).filter((range) => !range.isOverage);
}

function findCurrentRangeIndex(ranges: ApiPricingRange[], quantity: number): number {
  const normalRanges = getNormalRanges(ranges);
  for (let index = 0; index < normalRanges.length; index += 1) {
    const max = normalRanges[index].maxConsultations ?? Number.MAX_SAFE_INTEGER;
    if (quantity <= max) return index;
  }
  return normalRanges.length;
}

type RangeBandDisplay = {
  label: string;
  sublabel: string;
};

/**
 * Formato de faixa nos 3 modelos com grade:
 * - faixas anteriores à última: `Faixa N - qty de max` + preço no sublabel
 * - última faixa ou faixa única: `qty consultas` + preço no sublabel
 */
function formatRangeBandDisplay(params: {
  rangeIndex: number;
  bandCount: number;
  quantity: number;
  bandMax: number | null;
  amount: number;
}): RangeBandDisplay {
  const { rangeIndex, bandCount, quantity, bandMax, amount } = params;
  const sublabel = formatCurrency(amount);
  const isLastOrOnly = bandCount <= 1 || rangeIndex >= bandCount - 1;

  if (isLastOrOnly) {
    return {
      label: `${formatConsultationCount(quantity)} consultas`,
      sublabel,
    };
  }

  const max = bandMax ?? quantity;
  return {
    label: `Faixa ${rangeIndex + 1} - ${formatConsultationCount(quantity)} de ${formatConsultationCount(max)}`,
    sublabel,
  };
}

function resolveBandIndex(bands: ApiPricingRange[], quantity: number): number {
  for (let index = 0; index < bands.length; index += 1) {
    const max = bands[index].maxConsultations ?? Number.MAX_SAFE_INTEGER;
    if (quantity <= max) return index;
  }
  return Math.max(bands.length - 1, 0);
}

function buildRangeConsumption(item: ApiBillingItem): BillingFranchiseConsumption {
  // REQ-1 (US 14628): modelos só-faixa — todas as consultas em Consultas feitas.
  const bands = (item.pricingRanges ?? []).map(normalizeApiPricingRange);
  const quantity = item.consultationQuantity;
  const amount = parseApiDecimal(item.packageValue);

  if (bands.length === 0) {
    return formatRangeBandDisplay({
      rangeIndex: 0,
      bandCount: 1,
      quantity,
      bandMax: null,
      amount,
    });
  }

  const rangeIndex = resolveBandIndex(bands, quantity);
  const currentRange = bands[rangeIndex];

  return formatRangeBandDisplay({
    rangeIndex,
    bandCount: bands.length,
    quantity,
    bandMax: currentRange?.maxConsultations ?? null,
    amount,
  });
}

function buildFranchiseConsumption(
  item: ApiBillingItem,
  pricingModel: BillingFranchisePricingModel,
): BillingFranchiseConsumption {
  const quantity = item.consultationQuantity;
  const included = item.includedConsultations ?? quantity;

  switch (pricingModel) {
    case "fixed":
    case "fixed_with_range_excess": {
      const cappedQuantity = Math.min(quantity, included);
      return {
        label: `${formatConsultationCount(cappedQuantity)} de ${formatConsultationCount(included)}`,
        sublabel: formatCurrency(parseApiDecimal(item.packagePrice ?? item.packageValue)),
      };
    }
    case "range_per_query":
    case "range_fixed":
      return buildRangeConsumption(item);
    default:
      return {
        label: `${formatConsultationCount(quantity)} de ${formatConsultationCount(included)}`,
        sublabel: formatCurrency(parseApiDecimal(item.packageValue)),
      };
  }
}

function resolveExcessConsultationQuantity(item: ApiBillingItem): number | undefined {
  const quantity = item.consultationQuantity;

  // Item dedicado de excedente: consultationQuantity já é a qtd excedente.
  if (item.isOverage) {
    return quantity > 0 ? quantity : undefined;
  }

  const included = item.includedConsultations;
  if (included === null || included === undefined) return undefined;
  if (quantity <= included) return undefined;
  return quantity - included;
}

/**
 * Detecta se as faixas são relativas ao excedente (1–50, 51–100…),
 * e não ao consumo absoluto (ex.: 501–550 após pacote de 500).
 */
function arePricingRangesExcessRelative(
  ranges: ApiPricingRange[],
  includedConsultations: number | null | undefined,
): boolean {
  if (
    includedConsultations === null ||
    includedConsultations === undefined ||
    ranges.length === 0
  ) {
    return false;
  }

  const [first] = ranges;
  const firstMin = first.minConsultations ?? 0;
  const firstMax = first.maxConsultations;

  // Grade absoluta pós-pacote tipicamente começa em included+1 (ex.: 101 com included 100).
  if (firstMin > 1 && firstMin >= includedConsultations) return false;

  // Grade relativa de excedente: começa em 1 e o pacote é maior que a 1ª faixa.
  return (
    firstMin <= 1 && firstMax !== null && firstMax !== undefined && includedConsultations > firstMax
  );
}

function buildFixedWithRangeExcessDisplay(item: ApiBillingItem): RangeBandDisplay | undefined {
  const overageValue = parseApiDecimal(item.overageValue);
  const quantity = item.consultationQuantity;
  const excessQty = resolveExcessConsultationQuantity(item);
  if (excessQty === null || excessQty === undefined) return undefined;

  // Toda a grade (inclui faixa aberta / isOverage) define última vs não-última (BILL-03).
  const ranges = (item.pricingRanges ?? []).map(normalizeApiPricingRange);

  if (ranges.length === 0) {
    return formatRangeBandDisplay({
      rangeIndex: 0,
      bandCount: 1,
      quantity: excessQty,
      bandMax: null,
      amount: overageValue,
    });
  }

  // Faixas relativas ao excedente: indexar pela qtd excedente.
  // Faixas absolutas (pós-pacote): indexar pelo consumo total.
  // Item dedicado `isOverage` já traz consultationQuantity = excedente.
  const bandQuantity =
    item.isOverage || arePricingRangesExcessRelative(ranges, item.includedConsultations)
      ? excessQty
      : quantity;

  let rangeIndex = 0;
  for (; rangeIndex < ranges.length; rangeIndex += 1) {
    const max = ranges[rangeIndex].maxConsultations ?? Number.MAX_SAFE_INTEGER;
    if (bandQuantity <= max) break;
  }
  if (rangeIndex >= ranges.length) {
    rangeIndex = ranges.length - 1;
  }

  const currentRange = ranges[rangeIndex];
  return formatRangeBandDisplay({
    rangeIndex,
    bandCount: ranges.length,
    quantity: excessQty,
    bandMax: currentRange?.maxConsultations ?? null,
    amount: overageValue,
  });
}

type ExcessDisplay = {
  label?: string;
  sublabel?: string;
};

function buildExcessDisplay(
  item: ApiBillingItem,
  pricingModel: BillingFranchisePricingModel,
): ExcessDisplay {
  const overageValue = parseApiDecimal(item.overageValue);
  const quantity = item.consultationQuantity;

  if (pricingModel === "fixed") {
    const excessQty = resolveExcessConsultationQuantity(item);
    if (excessQty === null || excessQty === undefined) {
      if (item.isOverage && overageValue > 0) {
        return { label: undefined, sublabel: formatCurrency(overageValue) };
      }
      return {};
    }
    return {
      label: `${formatConsultationCount(excessQty)} consultas`,
      sublabel: formatCurrency(overageValue),
    };
  }

  // REQ-1 (US 14628): modelos só-faixa nunca exibem excedente (coluna zerada).
  if (pricingModel === "range_per_query" || pricingModel === "range_fixed") {
    return {};
  }

  if (pricingModel === "fixed_with_range_excess") {
    const display = buildFixedWithRangeExcessDisplay(item);
    if (!display) return {};
    return { label: display.label, sublabel: display.sublabel };
  }

  if (overageValue <= 0) return {};

  return { sublabel: formatCurrency(overageValue) };
}

function mapExcessUnitPrice(excessUnitPrice: string | null | undefined): number | undefined {
  if (excessUnitPrice === null || excessUnitPrice === undefined || excessUnitPrice === "") {
    return undefined;
  }
  return parseApiDecimal(excessUnitPrice);
}

function isOverageBillingItem(item: ApiBillingItem): boolean {
  return item.isOverage === true;
}

function isExcessOnlyBillingPeriod(
  item: ApiBillingItem,
  pricingModel: BillingFranchisePricingModel,
  overageValue: number,
): boolean {
  if (pricingModel !== "fixed" && pricingModel !== "fixed_with_range_excess") {
    return false;
  }

  if (isOverageBillingItem(item) && overageValue > 0) {
    return true;
  }

  const packageValue = parseApiDecimal(item.packageValue);
  return packageValue <= 0 && overageValue > 0;
}

function resolveFranchiseDueDate(items: ApiBillingItem[]): string | undefined {
  return items.find((item) => item.dueDate)?.dueDate ?? undefined;
}

function sumBillingItemValues(items: ApiBillingItem[]): number {
  return items.reduce((sum, item) => sum + parseApiDecimal(item.value), 0);
}

function resolveGroupOverageAmount(overageItems: ApiBillingItem[]): number {
  return overageItems.reduce((sum, item) => {
    const overageValue = parseApiDecimal(item.overageValue);
    if (overageValue > 0) return sum + overageValue;
    return sum + parseApiDecimal(item.value);
  }, 0);
}

function groupBillingItemsByFranchise(items: ApiBillingItem[]): ApiBillingItem[][] {
  const groups = new Map<string, ApiBillingItem[]>();
  const order: string[] = [];

  for (const item of items) {
    const key = item.deductible?.value ?? item.id;
    const current = groups.get(key);
    if (!current) {
      order.push(key);
      groups.set(key, [item]);
      continue;
    }
    current.push(item);
  }

  return order.map((key) => groups.get(key) ?? []);
}

function resolveItemOverageAmount(item: ApiBillingItem): number {
  const overageValue = parseApiDecimal(item.overageValue);
  if (overageValue > 0) return overageValue;
  if (isOverageBillingItem(item)) return parseApiDecimal(item.value);
  return overageValue;
}

function mapItemToFranchiseLine(
  item: ApiBillingItem,
  scope: BillingInvoiceScope,
): BillingFranchiseLine {
  const pricingModel = mapApiBillingModelToPricingModel(item.billingModel);
  const overageValue = resolveItemOverageAmount(item);
  const isRangeOnlyModel = pricingModel === "range_per_query" || pricingModel === "range_fixed";
  const itemForLabels: ApiBillingItem =
    overageValue !== parseApiDecimal(item.overageValue)
      ? { ...item, overageValue: String(overageValue) }
      : item;

  const excessDisplay = buildExcessDisplay(itemForLabels, pricingModel);

  return {
    id: item.deductible?.value ?? item.id,
    billingItemId: item.id,
    name: item.deductible?.label ?? "",
    pricingModel,
    fixedPrice:
      pricingModel === "fixed" || pricingModel === "fixed_with_range_excess"
        ? parseApiDecimal(item.packagePrice ?? item.packageValue)
        : undefined,
    priceRanges: mapApiPricingRanges(item.pricingRanges, pricingModel),
    excessUnitPrice: mapExcessUnitPrice(item.excessUnitPrice),
    consumption: buildFranchiseConsumption(item, pricingModel),
    // REQ-1: coluna Excedente sempre zerada nos modelos só-faixa
    excessAmount: isRangeOnlyModel ? 0 : overageValue,
    excessLabel: excessDisplay.label,
    excessSublabel: excessDisplay.sublabel,
    total: parseApiDecimal(item.value),
    dueDate: resolveFranchiseDueDate([item]),
    isExcessOnlyBilling: isExcessOnlyBillingPeriod(item, pricingModel, overageValue),
  };
}

/**
 * Une item de pacote + item de excedente (`isOverage`) do mesmo deductible numa linha de UI.
 */
function mapFranchiseGroupToLine(
  items: ApiBillingItem[],
  scope: BillingInvoiceScope,
): BillingFranchiseLine {
  if (items.length === 1) {
    return mapItemToFranchiseLine(items[0], scope);
  }

  const packageItems = items.filter((item) => !isOverageBillingItem(item));
  const overageItems = items.filter(isOverageBillingItem);

  if (overageItems.length === 0) {
    const base = mapItemToFranchiseLine(packageItems[0] ?? items[0], scope);
    return { ...base, total: sumBillingItemValues(items) };
  }

  if (packageItems.length === 0) {
    const [primary] = overageItems;
    const overageAmount = resolveGroupOverageAmount(overageItems);
    const line = mapItemToFranchiseLine({ ...primary, overageValue: String(overageAmount) }, scope);
    return {
      ...line,
      excessAmount: overageAmount,
      total: sumBillingItemValues(overageItems),
      isExcessOnlyBilling: true,
      dueDate: resolveFranchiseDueDate(overageItems),
    };
  }

  const [packageItem] = packageItems;
  const [overageItem] = overageItems;
  const pricingModel = mapApiBillingModelToPricingModel(
    packageItem.billingModel ?? overageItem.billingModel,
  );
  const isRangeOnlyModel = pricingModel === "range_per_query" || pricingModel === "range_fixed";
  const overageAmount = resolveGroupOverageAmount(overageItems);
  const pricingRanges =
    packageItem.pricingRanges?.length && packageItem.pricingRanges.length > 0
      ? packageItem.pricingRanges
      : overageItem.pricingRanges;

  // Item de excedente já traz consultationQuantity = qtd excedente; reutiliza para faixa relativa.
  const excessSourceItem: ApiBillingItem = {
    ...packageItem,
    overageValue: String(overageAmount),
    pricingRanges,
    consultationQuantity: overageItem.consultationQuantity,
    includedConsultations: packageItem.includedConsultations ?? overageItem.includedConsultations,
    isOverage: true,
  };
  const excessDisplay = isRangeOnlyModel ? {} : buildExcessDisplay(excessSourceItem, pricingModel);

  return {
    id: packageItem.deductible?.value ?? packageItem.id,
    // Path param de email-consumption: item de pacote da competência (não o de excedente).
    billingItemId: packageItem.id,
    name: packageItem.deductible?.label ?? overageItem.deductible?.label ?? "",
    pricingModel,
    fixedPrice:
      pricingModel === "fixed" || pricingModel === "fixed_with_range_excess"
        ? parseApiDecimal(
            packageItem.packagePrice ?? overageItem.packagePrice ?? packageItem.packageValue,
          )
        : undefined,
    priceRanges: mapApiPricingRanges(pricingRanges, pricingModel),
    excessUnitPrice: mapExcessUnitPrice(packageItem.excessUnitPrice ?? overageItem.excessUnitPrice),
    consumption: buildFranchiseConsumption(packageItem, pricingModel),
    excessAmount: isRangeOnlyModel ? 0 : overageAmount,
    excessLabel: excessDisplay.label,
    excessSublabel: excessDisplay.sublabel,
    total: sumBillingItemValues(items),
    dueDate: resolveFranchiseDueDate(items),
    isExcessOnlyBilling: false,
  };
}

function mapItemsToFranchiseLines(
  items: ApiBillingItem[],
  scope: BillingInvoiceScope,
): BillingFranchiseLine[] {
  return groupBillingItemsByFranchise(items).map((group) => mapFranchiseGroupToLine(group, scope));
}

function mapAdjustment(adjustment: ApiMonetaryAdjustmentResponse): BillingInvoiceAdjustment | null {
  if (adjustment.type !== "discount" && adjustment.type !== "surcharge") {
    return null;
  }

  const franchiseName = adjustment.deductible?.label?.trim() || undefined;
  const contractName = adjustment.contract?.label?.trim() || undefined;

  return {
    id: adjustment.id,
    type: adjustment.type,
    description: contractName
      ? formatContractAdjustmentDescription(contractName, adjustment.description)
      : adjustment.description,
    amount: parseApiDecimal(adjustment.amount),
    franchiseName,
  };
}

function resolveMonthValue(monthValue: ApiMonthValue): string | undefined {
  const competence = mapMonthRefToCompetence(monthValue);
  return competence || undefined;
}

function resolveCompetenceFromItems(items: ApiBillingItem[]): string | undefined {
  for (const item of items) {
    const competence = resolveMonthValue(item.competenceMonth);
    if (competence) return competence;
  }

  return undefined;
}

function resolveDueDateFromItems(items: ApiBillingItem[]): string | undefined {
  for (const item of items) {
    if (item.dueDate) return item.dueDate;
  }

  return undefined;
}

function resolveDueDateFromMetadata(
  ownerName: string,
  metadata: ApiNfeMetadataItem[] | null | undefined,
  options?: { singleContract?: boolean },
): string | undefined {
  if (!metadata?.length) return undefined;

  const match = metadata.find(
    (item) =>
      item.label === ownerName || item.ownerName === ownerName || item.owner_name === ownerName,
  );

  if (match) {
    return match.dueDate ?? match.due_date ?? undefined;
  }

  if (options?.singleContract && metadata.length === 1) {
    return metadata[0].dueDate ?? metadata[0].due_date ?? undefined;
  }

  return undefined;
}

/** Resolve o valor mínimo de contrato aplicável ao item/contexto informado. */
export function resolveContractMinimumValue(
  contractId: string,
  contractMinimumValue: number | null | undefined,
  options: { contractCount: number; entryContractId?: string | null },
): number | undefined {
  if (
    contractMinimumValue === undefined ||
    contractMinimumValue === null ||
    contractMinimumValue <= 0
  ) {
    return undefined;
  }

  if (options.contractCount === 1) {
    return contractMinimumValue;
  }

  if (options.entryContractId && options.entryContractId === contractId) {
    return contractMinimumValue;
  }

  return undefined;
}

function enrichContractMinimumValue(
  contracts: BillingContractDetail[],
  contractMinimumValue: number | null | undefined,
  entryContractId?: string | null,
): BillingContractDetail[] {
  const parsedMinimum =
    contractMinimumValue !== undefined && contractMinimumValue !== null && contractMinimumValue > 0
      ? contractMinimumValue
      : null;

  if (!parsedMinimum) {
    return contracts;
  }

  return contracts.map((contract) => {
    if (contract.minimumValue !== undefined && contract.minimumValue > 0) {
      return contract;
    }

    const minimumValue = resolveContractMinimumValue(contract.id, parsedMinimum, {
      contractCount: contracts.length,
      entryContractId,
    });

    return minimumValue !== undefined ? { ...contract, minimumValue } : contract;
  });
}

function enrichEntryContractMetadata(
  contracts: BillingContractDetail[],
  entry: ApiBillingEntryResponse,
  items: ApiBillingItem[],
  scope: BillingInvoiceScope,
): BillingContractDetail[] {
  const entryCompetence =
    resolveMonthValue(entry.competenceMonth) || resolveMonthValue(entry.referenceMonth);
  const singleContract = contracts.length === 1;
  const contractMinimumValue = parseApiDecimal(entry.contractMinimumValue);

  return contracts.map((contract) => {
    const contractItems = items.filter((item) => item.contract?.value === contract.id);
    const competence =
      contract.competence || resolveCompetenceFromItems(contractItems) || entryCompetence;

    const dueDate =
      (scope === "client" ? entry.dueDate : undefined) ||
      contract.dueDate ||
      resolveDueDateFromItems(contractItems) ||
      resolveDueDateFromMetadata(contract.name, entry.nfeMetadata, { singleContract }) ||
      (singleContract ? (entry.dueDate ?? undefined) : undefined);

    const franchises =
      scope === "deductible" || scope === "client"
        ? contract.franchises.map((franchise) => {
            if (scope !== "client" && franchise.dueDate) return franchise;

            const franchiseItem = contractItems.find(
              (item) => item.deductible?.value === franchise.id,
            );
            const franchiseDueDate =
              (scope === "client" ? entry.dueDate : undefined) ||
              franchise.dueDate ||
              franchiseItem?.dueDate ||
              resolveDueDateFromMetadata(franchise.name, entry.nfeMetadata) ||
              (singleContract ? (entry.dueDate ?? undefined) : undefined);

            return franchiseDueDate ? { ...franchise, dueDate: franchiseDueDate } : franchise;
          })
        : contract.franchises;

    return {
      ...contract,
      competence,
      dueDate: dueDate ?? undefined,
      franchises,
      minimumValue:
        contract.minimumValue ??
        resolveContractMinimumValue(contract.id, contractMinimumValue, {
          contractCount: contracts.length,
          entryContractId: entry.contract?.value,
        }),
    };
  });
}

function enrichInvoiceContractMetadata(
  contracts: BillingContractDetail[],
  invoice: ApiInvoiceResponse,
): BillingContractDetail[] {
  const contractMinimumValue = parseApiDecimal(invoice.contractMinimumValue);

  return enrichContractMinimumValue(contracts, contractMinimumValue, invoice.contract?.value);
}

function sumMonetaryAdjustmentDelta(adjustments: BillingInvoiceAdjustment[]): number {
  return adjustments.reduce(
    (sum, adjustment) =>
      adjustment.type === "discount" ? sum - adjustment.amount : sum + adjustment.amount,
    0,
  );
}

function hasMonetaryAdjustments(adjustments: BillingInvoiceAdjustment[] | undefined): boolean {
  return Boolean(
    adjustments?.some(
      (adjustment) => adjustment.type === "discount" || adjustment.type === "surcharge",
    ),
  );
}

function resolveItemBaseValue(item: ApiBillingItem): number {
  if ("calculatedValue" in item) {
    return parseApiDecimal(item.calculatedValue ?? item.value);
  }

  return parseApiDecimal(item.value);
}

/**
 * BillingEntry já reflete acréscimos/descontos em item.value.
 * O subtotal do contrato usa calculatedValue; o total do contrato aplica o delta
 * dos ajustes monetários apenas sobre itens automáticos (faturas manuais ficam fora).
 */
function reconcileEntryContractTotals(
  contracts: BillingContractDetail[],
  items: ApiBillingItem[],
): BillingContractDetail[] {
  return contracts.map((contract) => {
    if (!hasMonetaryAdjustments(contract.adjustments)) {
      return contract;
    }

    const contractItems = items.filter((item) => item.contract?.value === contract.id);
    const baseSubtotal = contractItems.reduce((sum, item) => sum + resolveItemBaseValue(item), 0);
    const adjustmentDelta = sumMonetaryAdjustmentDelta(contract.adjustments ?? []);

    const franchises = contract.franchises.map((franchise) => {
      const relatedItems = contractItems.filter(
        (item) => (item.deductible?.value ?? item.id) === franchise.id,
      );
      if (relatedItems.length === 0) return franchise;

      return {
        ...franchise,
        total: relatedItems.reduce((sum, item) => sum + resolveItemBaseValue(item), 0),
      };
    });

    return {
      ...contract,
      franchises,
      subtotalWithoutAdjustments: baseSubtotal,
      total: baseSubtotal + adjustmentDelta,
    };
  });
}

/**
 * Competência só-excedente (CMV-04/05/06): Consultas feitas = R$ 0,00.
 * Se Excedente já tem display (US 14628 / preço fixo), preserva; senão (só-faixa)
 * move o consumo para a coluna Excedente.
 */
function remapFranchiseForExcessOnlyCompetence(
  franchise: BillingFranchiseLine,
): BillingFranchiseLine {
  const excessAmount = franchise.excessAmount > 0 ? franchise.excessAmount : franchise.total;
  const hasExistingExcess = Boolean(franchise.excessLabel || franchise.excessSublabel);

  if (hasExistingExcess) {
    return {
      ...franchise,
      consumption: { label: formatCurrency(0) },
      excessAmount,
    };
  }

  return {
    ...franchise,
    consumption: { label: formatCurrency(0) },
    excessLabel: franchise.consumption.label,
    excessSublabel:
      franchise.total > 0 ? formatCurrency(franchise.total) : franchise.consumption.sublabel,
    excessAmount,
  };
}

function buildContractFromItems(
  contractId: string,
  contractName: string,
  items: ApiBillingItem[],
  scope: BillingInvoiceScope,
  adjustments: BillingInvoiceAdjustment[],
  minimumValue?: number,
  groupId?: string,
  invoiceMode?: BillingInvoiceMode,
): BillingContractDetail {
  const competenceType = resolveContractCompetenceType(items);
  const isExcessOnlyCompetence = competenceType === "excess_only";

  let franchises = mapItemsToFranchiseLines(items, scope);
  if (isExcessOnlyCompetence) {
    franchises = franchises.map(remapFranchiseForExcessOnlyCompetence);
  }

  const subtotalWithoutAdjustments = franchises.reduce(
    (sum, franchise) => sum + franchise.total,
    0,
  );

  const adjustmentDelta = adjustments.reduce((sum, adjustment) => {
    return adjustment.type === "discount" ? sum - adjustment.amount : sum + adjustment.amount;
  }, 0);

  let total: number;

  // CMV-08: competência só-excedente = Σ values (sem reaplicar minimumValue)
  if (isExcessOnlyCompetence) {
    total = subtotalWithoutAdjustments + adjustmentDelta;
  } else if (minimumValue !== undefined && minimumValue > 0) {
    const excessTotal = franchises.reduce((sum, franchise) => sum + franchise.excessAmount, 0);
    total = minimumValue + excessTotal + adjustmentDelta;
  } else {
    total = subtotalWithoutAdjustments + adjustmentDelta;
  }

  const competence = resolveCompetenceFromItems(items);
  const dueDate = resolveDueDateFromItems(items);

  return {
    id: contractId,
    name: contractName,
    groupId,
    invoiceMode,
    competence,
    dueDate: dueDate ?? undefined,
    minimumValue,
    isExcessOnlyCompetence: isExcessOnlyCompetence || undefined,
    franchises,
    adjustments: adjustments.length > 0 ? adjustments : undefined,
    subtotalWithoutAdjustments,
    total,
  };
}

function resolveAdjustmentContractId(
  adjustment: ApiMonetaryAdjustmentResponse,
  items: ApiBillingItem[],
): string | undefined {
  if (adjustment.contract?.value) {
    return adjustment.contract.value;
  }

  if (adjustment.deductible?.value) {
    return items.find((item) => item.deductible?.value === adjustment.deductible?.value)?.contract
      ?.value;
  }

  return undefined;
}

function resolveMetadataGroupIndexes(metadata?: ApiNfeMetadataItem[] | null) {
  const groupIdByContractId = new Map<string, string>();
  const groupIdByContractName = new Map<string, string>();

  for (const item of metadata ?? []) {
    if (item.type?.toLowerCase() !== "group") continue;

    const names = [...new Set((item.names ?? []).map((name) => name.trim()).filter(Boolean))];
    if (names.length < 2) continue;

    const groupId = item.id || `nfe-group:${names.map((name) => name.toLocaleLowerCase()).join("|")}`;
    for (const name of names) {
      groupIdByContractName.set(name.toLocaleLowerCase(), groupId);
    }
    for (const contractId of item.contractIds ?? []) {
      if (contractId) groupIdByContractId.set(contractId, groupId);
    }
  }

  return { groupIdByContractId, groupIdByContractName };
}

function groupItemsIntoContracts(
  items: ApiBillingItem[],
  scope: BillingInvoiceScope,
  billingAdjustments: ApiMonetaryAdjustmentResponse[] = [],
  contractMinimumValue?: number | null,
  entryContractId?: string | null,
  context?: BillingPaymentContext | null,
  nfeMetadata?: ApiNfeMetadataItem[] | null,
): BillingContractDetail[] {
  const metadataGroups = resolveMetadataGroupIndexes(nfeMetadata);
  const grouped = new Map<string, { name: string; items: ApiBillingItem[]; groupId?: string }>();

  for (const item of items) {
    const contractId = item.contract?.value;
    if (!contractId) continue;

    const current = grouped.get(contractId) ?? {
      name: item.contract?.label ?? "",
      items: [],
      groupId:
        item.contractGroupId ??
        context?.groupIdByContractId.get(contractId) ??
        metadataGroups.groupIdByContractId.get(contractId) ??
        metadataGroups.groupIdByContractName.get(item.contract?.label?.trim().toLocaleLowerCase() ?? ""),
    };
    current.items.push(item);
    grouped.set(contractId, current);
  }

  const monetaryAdjustmentsByContract = new Map<string, BillingInvoiceAdjustment[]>();

  for (const adjustment of billingAdjustments) {
    const mapped = mapAdjustment(adjustment);
    if (!mapped) continue;

    const contractId = resolveAdjustmentContractId(adjustment, items);
    if (!contractId) continue;

    const current = monetaryAdjustmentsByContract.get(contractId) ?? [];
    current.push(mapped);
    monetaryAdjustmentsByContract.set(contractId, current);
  }

  const contracts = Array.from(grouped.entries()).map(
    ([contractId, { name, items: contractItems, groupId }]) => {
      const minimumValue = resolveContractMinimumValue(contractId, contractMinimumValue, {
        contractCount: grouped.size,
        entryContractId,
      });

      return buildContractFromItems(
        contractId,
        name,
        contractItems,
        scope,
        monetaryAdjustmentsByContract.get(contractId) ?? [],
        minimumValue,
        groupId,
        normalizeBillingInvoiceMode(context?.contracts.find((contract) => contract.id === contractId)?.mode),
      );
    },
  );

  return contracts.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

function normalizeBillingInvoiceMode(mode: string | null | undefined): BillingInvoiceMode | undefined {
  const normalized = mode?.trim().toLowerCase();
  if (normalized === "contract") return "contract";
  if (normalized === "franchise" || normalized === "deductible") return "franchise";
  return undefined;
}

function isManualBillingItem(item: ApiBillingItem): boolean {
  return "isManual" in item && item.isManual === true;
}

function filterConsumableBillingItems(items: ApiBillingItem[]): ApiBillingItem[] {
  return items.filter((item) => !isManualBillingItem(item));
}

/**
 * Mapeia item manual de BillingEntry para o domínio.
 */
export function mapManualInvoiceFromEntryItem(
  item: ApiBillingEntryItemResponse,
  entry: ApiBillingEntryResponse,
): BillingManualInvoice {
  return {
    id: item.id,
    competence:
      mapMonthRefToCompetence(item.competenceMonth) ||
      mapMonthRefToCompetence(entry.competenceMonth) ||
      mapMonthRefToCompetence(entry.referenceMonth),
    description: item.description ?? entry.description ?? "",
    value: parseApiDecimal(item.value),
    dueDate: item.dueDate ?? "",
    separateNote: item.isSeparateNfe ?? entry.isSeparateNfe ?? false,
    contractId: item.contract?.value ?? entry.contract?.value,
    contractName: item.contract?.label ?? entry.contract?.label,
    productId: item.product?.value ?? "",
    productName: item.product?.label ?? "",
    profitCenter: item.profitCenter?.label ?? entry.profitCenter?.label ?? "",
    excessProfitCenter: item.overageProfitCenter?.label,
  };
}

/**
 * Mapeia manual invoice from api do formato da API para o domínio.
 * @param invoice - invoice
 */
export function mapManualInvoiceFromApi(invoice: ApiInvoiceResponse): BillingManualInvoice {
  return {
    id: invoice.id,
    competence:
      mapMonthRefToCompetence(invoice.competenceMonth) ||
      mapMonthRefToCompetence(invoice.referenceMonth),
    description: invoice.description ?? "",
    value: parseApiDecimal(invoice.totalValue),
    dueDate: invoice.dueDate ?? "",
    separateNote: invoice.isSeparateNfe ?? false,
    contractId: invoice.contract?.value,
    contractName: invoice.contract?.label,
    productId: invoice.product?.value ?? "",
    productName: invoice.product?.label ?? "",
    profitCenter: invoice.profitCenter?.label ?? "",
    excessProfitCenter: invoice.overageProfitCenter?.label,
  };
}

/**
 * Meses candidatos para buscar faturas manuais complementarmente na listagem.
 * Inclui competência/referência da invoice e competências dos itens (podem divergir).
 */
export function collectManualInvoiceLookupMonths(invoice: ApiInvoiceResponse): string[] {
  const months = new Set<string>();
  const add = (monthValue: ApiMonthValue | null | undefined) => {
    const mapped = mapMonthRefToCompetence(monthValue);
    if (mapped) months.add(mapped);
  };

  add(invoice.competenceMonth);
  add(invoice.referenceMonth);
  for (const item of invoice.items ?? []) {
    add(item.competenceMonth);
  }

  return Array.from(months);
}

/** Mapeia item manual embutido em invoice.items para o domínio. */
export function mapManualInvoiceFromInvoiceItem(
  item: ApiInvoiceItemResponse,
  invoice: ApiInvoiceResponse,
): BillingManualInvoice {
  return {
    id: item.id,
    competence:
      mapMonthRefToCompetence(item.competenceMonth) ||
      mapMonthRefToCompetence(invoice.competenceMonth) ||
      mapMonthRefToCompetence(invoice.referenceMonth),
    description: item.description ?? invoice.description ?? "",
    value: parseApiDecimal(item.value),
    dueDate: item.dueDate ?? "",
    separateNote: item.isSeparateNfe ?? invoice.isSeparateNfe ?? false,
    contractId: item.contract?.value ?? invoice.contract?.value ?? undefined,
    contractName: item.contract?.label ?? invoice.contract?.label ?? undefined,
    productId: item.product?.value ?? "",
    productName: item.product?.label ?? "",
    profitCenter: item.profitCenter?.label ?? invoice.profitCenter?.label ?? "",
    excessProfitCenter: item.overageProfitCenter?.label,
  };
}

/** Obtém faturas manuais vinculadas a partir da resposta de invoice. */
export function resolveManualInvoicesFromApi(invoice: ApiInvoiceResponse): BillingManualInvoice[] {
  const fromEmbeddedOrSelf = invoice.manualInvoices?.length
    ? invoice.manualInvoices.map(mapManualInvoiceFromApi)
    : invoice.isManual
      ? [mapManualInvoiceFromApi(invoice)]
      : [];

  const fromItems = (invoice.items ?? [])
    .filter((item) => item.isManual === true)
    .map((item) => mapManualInvoiceFromInvoiceItem(item, invoice));

  return mergeManualInvoicesForDetail(fromEmbeddedOrSelf, fromItems);
}

/**
 * Une faturas manuais da listagem secundária com as do detalhe da invoice.
 * List vazia → fallback para API; ambas com dados → união sem duplicar `id`.
 */
export function mergeManualInvoicesForDetail(
  fromList: BillingManualInvoice[],
  fromDetail: BillingManualInvoice[],
): BillingManualInvoice[] {
  if (fromList.length === 0) {
    return fromDetail;
  }

  if (fromDetail.length === 0) {
    return fromList;
  }

  const byId = new Map<string, BillingManualInvoice>();
  for (const manual of fromList) {
    byId.set(manual.id, manual);
  }
  for (const manual of fromDetail) {
    if (!byId.has(manual.id)) {
      byId.set(manual.id, manual);
    }
  }
  return Array.from(byId.values());
}

/** Obtém faturas manuais a partir dos itens/legado de uma billing entry. */
export function resolveManualInvoicesFromEntry(
  entry: ApiBillingEntryResponse,
): BillingManualInvoice[] {
  const manualItems = (entry.items ?? []).filter((item) => item.isManual);
  if (manualItems.length > 0) {
    return manualItems.map((item) => mapManualInvoiceFromEntryItem(item, entry));
  }

  if (!entry.manualInvoices?.length) {
    return [];
  }

  return entry.manualInvoices.map(mapManualInvoiceFromApi);
}

/** Retorna a fatura manual recém-criada na resposta da entry. */
export function resolveCreatedManualInvoiceFromEntry(
  entry: ApiBillingEntryResponse,
): BillingManualInvoice {
  const manualItems = (entry.items ?? []).filter((item) => item.isManual);
  const latestManualItem = manualItems.at(-1);

  if (latestManualItem) {
    return mapManualInvoiceFromEntryItem(latestManualItem, entry);
  }

  const fromLegacy = resolveManualInvoicesFromEntry(entry);
  if (fromLegacy.length > 0) {
    return fromLegacy[fromLegacy.length - 1];
  }

  throw new Error("Resposta da API não contém item manual criado");
}

function sumManualValuesByContractId(manuals: BillingManualInvoice[]): Map<string, number> {
  const deltaByContract = new Map<string, number>();

  for (const manual of manuals) {
    if (manual.separateNote || !manual.contractId) continue;
    deltaByContract.set(
      manual.contractId,
      (deltaByContract.get(manual.contractId) ?? 0) + manual.value,
    );
  }

  return deltaByContract;
}

/**
 * Soma faturas manuais vinculadas no total de cada contrato (scope contract).
 * invoiceTotal permanece inalterado — a API já unifica o valor geral.
 */
export function applyManualInvoicesToContractTotals(
  detail: BillingInvoiceDetail,
): BillingInvoiceDetail {
  if (detail.invoiceDetails.scope !== "contract") {
    return detail;
  }

  const deltaByContract = sumManualValuesByContractId(detail.manualInvoices ?? []);
  if (deltaByContract.size === 0) {
    return detail;
  }

  return {
    ...detail,
    contracts: detail.contracts.map((contract) => {
      const delta = deltaByContract.get(contract.id) ?? 0;
      if (!delta) return contract;

      return {
        ...contract,
        total: contract.total + delta,
      };
    }),
  };
}

/** Finaliza o detalhe de billing depois que a origem já agrupou seus contratos. */
function buildBillingDetail(
  record: ReturnType<typeof mapInvoiceToRecord> | ReturnType<typeof mapBillingEntryToRecord>,
  description: string | null | undefined,
  contracts: BillingInvoiceDetail["contracts"],
  invoiceTotal: number,
  manualInvoices: BillingManualInvoice[],
): BillingInvoiceDetail {
  return applyManualInvoicesToContractTotals({
    ...record,
    description: description ?? undefined,
    contracts,
    invoiceTotal,
    manualInvoices: manualInvoices.length > 0 ? manualInvoices : undefined,
  });
}

/** Mapeia invoice da API para o detalhe de faturamento do domínio. */
export function mapInvoiceToDetail(
  invoice: ApiInvoiceResponse,
  manualInvoicesOverride?: BillingManualInvoice[],
  context?: BillingPaymentContext | null,
): BillingInvoiceDetail {
  const scope = mapNfeUnificationLevel(invoice.nfeUnificationLevel);
  const record = mapInvoiceToRecord(invoice, context);
  const contractMinimumValue = parseApiDecimal(invoice.contractMinimumValue);
  const items = filterConsumableBillingItems(invoice.items ?? []);
  const manualInvoices = manualInvoicesOverride ?? resolveManualInvoicesFromApi(invoice);

  return buildBillingDetail(
    record,
    invoice.description,
    enrichInvoiceContractMetadata(
      groupItemsIntoContracts(
        items,
        scope,
        invoice.adjustments ?? [],
        contractMinimumValue > 0 ? contractMinimumValue : null,
        invoice.contract?.value,
        context,
        invoice.nfeMetadata,
      ),
      invoice,
    ),
    parseApiDecimal(invoice.totalValue),
    manualInvoices,
  );
}

/**
 * Mapeia billing entry to detail do formato da API para o domínio.
 * @param entry - entry
 */
export function mapBillingEntryToDetail(
  entry: ApiBillingEntryResponse,
  context?: BillingPaymentContext | null,
): BillingInvoiceDetail {
  const scope = mapNfeUnificationLevel(entry.nfeUnificationLevel);
  const record = mapBillingEntryToRecord(entry, context);
  const items = filterConsumableBillingItems(entry.items ?? []);
  const manualInvoices = resolveManualInvoicesFromEntry(entry);
  const entryTotal = parseApiDecimal(entry.totalValue);
  const contractMinimumValue = parseApiDecimal(entry.contractMinimumValue);
  const contracts = reconcileEntryContractTotals(
    enrichEntryContractMetadata(
      groupItemsIntoContracts(
        items,
        scope,
        entry.adjustments ?? [],
        contractMinimumValue > 0 ? contractMinimumValue : null,
        entry.contract?.value,
        context,
        entry.nfeMetadata,
      ),
      entry,
      items,
      scope,
    ),
    items,
  );

  return buildBillingDetail(record, entry.description, contracts, entryTotal, manualInvoices);
}
