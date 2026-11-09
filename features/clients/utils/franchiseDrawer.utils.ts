/**
 * Identificador de passo do drawer de franquia.
 */
export type FranchiseDrawerStep =
  | "basic"
  | "payment"
  | "billing"
  | "products"
  | "sources"
  | "templates";

/**
 * Define se o step atual deve persistir a franquia ao avançar.
 */
export function shouldPersistFranchiseOnStepProceed(
  step: FranchiseDrawerStep,
  isPersisted: boolean,
): boolean {
  if (step === "basic" || step === "payment") {
    return false;
  }

  if (step === "billing") {
    return true;
  }

  return isPersisted;
}

/** Verifica se o estado atual permite avançar no fluxo de franquia. */
export function isFranchiseStepProceedable({
  step,
  state,
  billingModels,
  isPaymentStepLoading,
  selectedBackgroundCheckTemplateIds,
  canListProducts,
  canListBackgroundCheckTemplates,
}: {
  step: FranchiseDrawerStep;
  state: CreateDeductibleRequest;
  billingModels: BillingModelOption[];
  isPaymentStepLoading: boolean;
  selectedBackgroundCheckTemplateIds: string[];
  canListProducts: boolean;
  canListBackgroundCheckTemplates: boolean;
}): boolean {
  if (step === "basic") {
    return Boolean(
      state.beginningTerm &&
        state.endTerm &&
        isFranchiseTermOrderValid({
          beginningTerm: state.beginningTerm,
          endTerm: state.endTerm,
        }),
    );
  }

  if (step === "payment") return !isPaymentStepLoading;

  if (step === "billing") {
    if (!state.billingModel) return false;

    const selectedOption = findBillingModelOption(state.billingModel, billingModels);
    const showFixedPrice = includesBillingSection(selectedOption, "fixedPrice");
    const showPriceRanges = includesBillingSection(selectedOption, "priceRanges");

    if (showFixedPrice && getFixedPriceIncludedConsultations(state.fixedPrice) < 1) return false;
    if (
      showPriceRanges &&
      !validatePriceRanges(state.priceRanges, {
        hasFixedPrice: showFixedPrice,
        includedConsultations: getFixedPriceIncludedConsultations(state.fixedPrice, 1),
      })
    ) {
      return false;
    }

    return validateExcessOrBlocking(state, selectedOption);
  }

  if (step === "products") {
    return (
      canListProducts &&
      state.productIds.length > 0 &&
      state.productIds.every((product) => Boolean(product.serviceTypeId))
    );
  }

  if (step === "templates") {
    return canListBackgroundCheckTemplates && selectedBackgroundCheckTemplateIds.length > 0;
  }

  return true;
}

/**
 * Retorna o label do botão primário do drawer de franquia.
 */
export function getFranchisePrimaryActionLabel(
  step: FranchiseDrawerStep,
  isLastStep: boolean,
  isPersisted: boolean,
): string {
  if (isLastStep) {
    return isPersisted ? "Salvar alterações" : "Criar Franquia";
  }

  if (step === "basic") {
    return "Prosseguir";
  }

  return "Salvar e prosseguir";
}
import type { BillingModelOption, CreateDeductibleRequest } from "../types/deductibles.types";
import {
  findBillingModelOption,
  getFixedPriceIncludedConsultations,
  includesBillingSection,
  validateExcessOrBlocking,
  validatePriceRanges,
} from "./billingModel.utils";
import { isFranchiseTermOrderValid } from "./franchiseTermBounds.utils";
