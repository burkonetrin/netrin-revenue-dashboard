import type { CreateDeductibleRequest, DetailedDeductibleResponse } from "../types/deductibles.types";
import { normalizeDeductibleProductInputs } from "./franchiseMockProduct.utils";
import { normalizePriceRanges } from "./priceRangeChain.utils";
import { DEFAULT_TEST_PERIOD_MONTHS } from "./testPeriodMonths.utils";

/** Normaliza valor monetário de cadastro comercial para até 4 casas decimais. */
function toCommercialMonetaryValue(value: string | number): number {
  const parsed = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(parsed)) return 0;
  return Math.round(parsed * 10000) / 10000;
}

function mapMonetaryValue(value: string | number, isCommercial: boolean): number {
  return isCommercial ? toCommercialMonetaryValue(value) : Number(value);
}

/**
 * Mapeia franquia da API para estado do formulário.
 */
export function mapDeductibleToFormState(
  deductibleData: DetailedDeductibleResponse,
): CreateDeductibleRequest {
  const isCommercial = !deductibleData.isTest;
  const hasFixedPrice =
    deductibleData.billingModel.requiredBillingModels?.includes("fixedPrice") ?? false;
  const includedConsultations = deductibleData.fixedPrice
    ? Number(deductibleData.fixedPrice.includedConsultations)
    : 1;
  const rawPriceRanges =
    deductibleData.priceRanges?.map((r) => ({
      minConsultations: Number(r.minConsultations),
      maxConsultations:
        r.maxConsultations === null || r.maxConsultations === undefined
          ? null
          : Number(r.maxConsultations),
      unitPrice: mapMonetaryValue(r.unitPrice, isCommercial),
    })) || [];
  const priceRanges =
    rawPriceRanges.length > 0
      ? normalizePriceRanges(rawPriceRanges, hasFixedPrice, includedConsultations)
      : [];

  const testPeriodMonths = deductibleData.isTest
    ? (deductibleData.testPeriodMonths ?? DEFAULT_TEST_PERIOD_MONTHS)
    : null;

  return {
    name: deductibleData.name,
    description: deductibleData.description,
    isTest: deductibleData.isTest,
    testPeriodMonths,
    beginningTerm: deductibleData.beginningTerm,
    endTerm: deductibleData.endTerm,
    automaticRenovation: deductibleData.automaticRenovation,
    proofExpiration: deductibleData.proofExpiration ?? 1,
    billingModel: deductibleData.billingModel.value,
    automaticBlocking: deductibleData.automaticBlocking,
    isActive: deductibleData.isActive,
    excessUnitPrice:
      deductibleData.excessUnitPrice === null || deductibleData.excessUnitPrice === undefined
        ? null
        : mapMonetaryValue(deductibleData.excessUnitPrice, isCommercial),
    productIds: normalizeDeductibleProductInputs(deductibleData.products),
    fixedPrice: deductibleData.fixedPrice
      ? {
          includedConsultations: Number(deductibleData.fixedPrice.includedConsultations),
          packagePrice: mapMonetaryValue(deductibleData.fixedPrice.packagePrice, isCommercial),
        }
      : undefined,
    priceRanges,
  };
}
