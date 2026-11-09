import { toApiDecimalString4 } from "@/shared/utils/currency";
import type {
  BillingModelField,
  BillingModelOption,
  BillingModelPayloadSection,
  CreateDeductibleApiPayload,
  CreateDeductibleRequest,
  DeductibleBillingModel,
  FixedPriceInfo,
} from "../types/deductibles.types";
import { normalizePriceRanges, validateChainedPriceRanges } from "./priceRangeChain.utils";

/**
 * Valores de preço fixo no formulário de cobrança.
 */
export type BillingFormFixedPrice = {
  includedConsultations?: number;
  packagePrice?: number;
};

/**
 * Identificador do modelo preço fixo com faixas.
 */
export const FIXED_PRICE_RANGE_BILLING_MODEL = "fixed_price_range" as const;

/**
 * Identificador do modelo "Faixa de valor com preço por consulta".
 * É o único modelo de cobrança permitido em contratos com valor mínimo.
 */
export const PRICE_RANGE_BILLING_MODEL = "price_range" as const;

/**
 * Verifica se o modelo inclui preço fixo com faixas.
 */
export function isFixedPriceRangeBillingModel(billingModel: string | undefined): boolean {
  return billingModel === FIXED_PRICE_RANGE_BILLING_MODEL;
}

/**
 * Rótulo do preço unitário por faixa.
 */
export function getPriceRangeUnitPriceLabel(billingModel: string | undefined): string {
  return isFixedPriceRangeBillingModel(billingModel)
    ? "Preço fixo por faixa"
    : "Preço por consulta";
}

/**
 * Extrai valor do modelo de cobrança.
 */
export function billingModelValue(bm: BillingModelField): DeductibleBillingModel {
  return bm.value;
}

/**
 * Extrai rótulo do modelo de cobrança.
 */
export function billingModelLabel(bm?: BillingModelField | null): string {
  if (!bm) return "—";
  return bm.label;
}

/**
 * Busca opção de modelo de cobrança por valor.
 */
export function findBillingModelOption(
  value: string | undefined,
  options: BillingModelOption[],
): BillingModelOption | undefined {
  if (!value) return undefined;
  return options.find((o) => o.value === value);
}

/**
 * Resolve opção de modelo de cobrança.
 */
export function resolveBillingModelOption(
  billingModel: BillingModelField | string | undefined,
  options: BillingModelOption[],
): BillingModelOption | undefined {
  if (!billingModel) return undefined;

  if (typeof billingModel === "string") {
    return findBillingModelOption(billingModel, options);
  }

  if (billingModel.requiredBillingModels?.length) {
    return {
      label: billingModel.label,
      value: billingModel.value,
      requiredBillingModels: billingModel.requiredBillingModels,
    };
  }

  return findBillingModelOption(billingModel.value, options);
}

/**
 * Verifica se modelo exige seção de cobrança.
 */
export function includesBillingSection(
  option: BillingModelOption | undefined,
  section: BillingModelPayloadSection,
): boolean {
  return option?.requiredBillingModels?.includes(section) ?? false;
}

/**
 * Verifica se modelo usa apenas faixas de preço.
 */
export function isPriceRangeOnlyOption(option: BillingModelOption): boolean {
  const { requiredBillingModels } = option;
  return requiredBillingModels?.length === 1 && requiredBillingModels[0] === "priceRanges";
}

/**
 * Verifica se modelo usa apenas preço fixo.
 */
export function isFixedPriceOnlyOption(option: BillingModelOption | undefined): boolean {
  const sections = option?.requiredBillingModels;
  return sections?.length === 1 && sections[0] === "fixedPrice";
}

/**
 * Valida preço de excedente ou bloqueio automático.
 * excessUnitPrice só se aplica a fixed_price; demais modelos não exigem o campo.
 */
export function validateExcessOrBlocking(
  state: CreateDeductibleRequest,
  option: BillingModelOption | undefined,
): boolean {
  if (!isFixedPriceOnlyOption(option)) {
    return true;
  }

  const excess = state.excessUnitPrice ?? 0;
  return state.automaticBlocking || excess > 0;
}

/**
 * Busca opção de modelo somente por faixas.
 */
export function findPriceRangeOnlyOption(
  options: BillingModelOption[],
): BillingModelOption | undefined {
  return options.find(isPriceRangeOnlyOption);
}

/**
 * Verifica se o modelo é o permitido em contratos com valor mínimo
 * ("Faixa de valor com preço por consulta").
 */
export function isMinimumContractBillingModel(value: string | undefined): boolean {
  return value === PRICE_RANGE_BILLING_MODEL;
}

/**
 * Busca o modelo de cobrança permitido em contratos com valor mínimo
 * ("Faixa de valor com preço por consulta").
 */
export function findMinimumContractBillingModel(
  options: BillingModelOption[],
): BillingModelOption | undefined {
  return findBillingModelOption(PRICE_RANGE_BILLING_MODEL, options);
}

/**
 * Obtém consultas inclusas no preço fixo.
 */
export function getFixedPriceIncludedConsultations(
  fixedPrice: FixedPriceInfo | undefined,
  fallback = 0,
): number {
  return fixedPrice?.includedConsultations ?? fallback;
}

/**
 * Obtém valor do pacote de preço fixo.
 */
export function getFixedPricePackagePrice(
  fixedPrice: FixedPriceInfo | undefined,
  fallback = 0,
): number {
  return fixedPrice?.packagePrice ?? fallback;
}

/**
 * Mapeia preço fixo da API para o formulário.
 */
export function mapFixedPriceToFormValues(
  fixedPrice: FixedPriceInfo | undefined,
): BillingFormFixedPrice {
  return {
    includedConsultations: getFixedPriceIncludedConsultations(fixedPrice),
    packagePrice: getFixedPricePackagePrice(fixedPrice),
  };
}

/**
 * Mapeia preço fixo do formulário para rascunho no estado do drawer,
 * independente do modelo de cobrança selecionado.
 */
export function mapFormFixedPriceToStoredState(
  fixedPrice: BillingFormFixedPrice | undefined,
): FixedPriceInfo | undefined {
  if (!fixedPrice) return undefined;

  return {
    includedConsultations: fixedPrice.includedConsultations ?? 0,
    packagePrice: fixedPrice.packagePrice ?? 0,
  };
}

/**
 * Mapeia preço fixo do formulário para estado.
 */
export function mapFormFixedPriceToState(
  fixedPrice: BillingFormFixedPrice | undefined,
  option: BillingModelOption | undefined,
): FixedPriceInfo | undefined {
  if (!fixedPrice || !includesBillingSection(option, "fixedPrice")) {
    return undefined;
  }

  return {
    includedConsultations: fixedPrice.includedConsultations ?? 0,
    packagePrice: fixedPrice.packagePrice ?? 0,
  };
}

/**
 * Monta payload de criação/atualização de franquia.
 */
export function buildDeductiblePayload(
  state: CreateDeductibleRequest,
  option: BillingModelOption | undefined,
): CreateDeductibleRequest {
  const { fixedPrice, priceRanges, automaticBlocking, excessUnitPrice, ...rest } = state;
  const isFixedOnly = isFixedPriceOnlyOption(option);
  const hasPriceRanges = includesBillingSection(option, "priceRanges");
  const normalizedRanges =
    hasPriceRanges && priceRanges?.length
      ? normalizePriceRanges(
          priceRanges,
          includesBillingSection(option, "fixedPrice"),
          getFixedPriceIncludedConsultations(fixedPrice, 1),
        )
      : undefined;

  const payload: CreateDeductibleRequest = {
    ...rest,
    // Modelos com faixa: última aberta cobre o excedente — não enviar excessUnitPrice.
    excessUnitPrice: isFixedOnly ? (excessUnitPrice ?? 0) : null,
    automaticBlocking: isFixedOnly ? automaticBlocking : false,
    ...(includesBillingSection(option, "fixedPrice") && fixedPrice
      ? {
          fixedPrice: {
            includedConsultations: getFixedPriceIncludedConsultations(fixedPrice),
            packagePrice: getFixedPricePackagePrice(fixedPrice),
          },
        }
      : {}),
    ...(normalizedRanges ? { priceRanges: normalizedRanges } : {}),
  };

  if (payload.isTest) {
    return {
      ...payload,
      automaticRenovation: false,
      testPeriodMonths: payload.testPeriodMonths ?? null,
    };
  }

  const { testPeriodMonths: _unusedTestPeriodMonths, ...withoutTestPeriod } = payload;
  return withoutTestPeriod;
}

/**
 * Serializa valores monetários de franquia comercial como string com 4 casas para a API.
 * Franquias de teste mantêm o formato numérico atual.
 */
export function serializeDeductiblePayloadForApi(
  payload: CreateDeductibleRequest,
): CreateDeductibleApiPayload {
  if (payload.isTest) {
    return payload as CreateDeductibleApiPayload;
  }

  return {
    ...payload,
    excessUnitPrice:
      payload.excessUnitPrice === null || payload.excessUnitPrice === undefined
        ? null
        : toApiDecimalString4(payload.excessUnitPrice),
    fixedPrice: payload.fixedPrice
      ? {
          includedConsultations: payload.fixedPrice.includedConsultations,
          packagePrice: toApiDecimalString4(payload.fixedPrice.packagePrice),
        }
      : undefined,
    priceRanges: payload.priceRanges?.map((range) => ({
      ...range,
      unitPrice: toApiDecimalString4(range.unitPrice),
    })),
  };
}

/**
 * Valida faixas de preço do formulário.
 */
export function validatePriceRanges(
  ranges: CreateDeductibleRequest["priceRanges"],
  options?: {
    hasFixedPrice?: boolean;
    includedConsultations?: number;
  },
): boolean {
  const hasFixedPrice = options?.hasFixedPrice ?? false;
  const includedConsultations = options?.includedConsultations ?? 1;

  return validateChainedPriceRanges(ranges, hasFixedPrice, includedConsultations);
}
