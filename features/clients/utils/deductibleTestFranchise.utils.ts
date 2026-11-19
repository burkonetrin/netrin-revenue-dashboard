import type { CreateDeductibleRequest } from "../types/deductibles.types";
import { getFixedPriceIncludedConsultations } from "./billingModel.utils";
import { DEFAULT_TEST_PERIOD_MONTHS } from "./testPeriodMonths.utils";

/**
 * Aplica valores padrão para franquia de teste.
 */
export function applyTestFranchiseDefaults(
  state: CreateDeductibleRequest,
): CreateDeductibleRequest {
  const testPeriodMonths =
    typeof state.testPeriodMonths === "number"
      ? state.testPeriodMonths
      : state.testPeriodMonths === null
        ? null
        : DEFAULT_TEST_PERIOD_MONTHS;

  return {
    ...state,
    isTest: true,
    billingModel: "fixed_price",
    automaticBlocking: true,
    automaticRenovation: false,
    excessUnitPrice: 0,
    testPeriodMonths,
    fixedPrice: {
      includedConsultations: getFixedPriceIncludedConsultations(state.fixedPrice, 1),
      packagePrice: 0,
    },
  };
}

/**
 * Mescla estado parcial no formulário de franquia.
 */
export function mergeDeductibleFormState(
  prev: CreateDeductibleRequest,
  next: Partial<CreateDeductibleRequest>,
): CreateDeductibleRequest {
  const merged = { ...prev, ...next };

  if (merged.isTest) {
    return applyTestFranchiseDefaults(merged);
  }

  return {
    ...merged,
    testPeriodMonths: null,
  };
}
