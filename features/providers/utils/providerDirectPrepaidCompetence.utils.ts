import type { ProviderInvoiceBillableSourceResponse } from "../types/providerInvoices.types";
import {
  type PrepaidCreditDepositDraft,
  applyMinimumFranchise,
  calculatePrepaidConsumption,
} from "./providerPrepaidCompetence.utils";

export interface DirectPrepaidCompetenceCalculationInput {
  startingBalance: string;
  creditDeposits: PrepaidCreditDepositDraft[];
  isMonthClosed: boolean;
  endingBalance: string;
  minimumFranchiseValue?: string | null;
  sources: Pick<ProviderInvoiceBillableSourceResponse, "clientBillableQuantity">[];
}

export type DirectPrepaidCompetenceCalculation =
  | {
      status: "valid";
      calculatedCost: string;
      finalCost: string;
      totalBillableQuantity: number;
    }
  | {
      status: "invalid";
      reason: "negative-deposit-consumption" | "negative-closing-consumption";
    };

/** Calculates prepaid consumption, applies the minimum franchise, and sums billable queries. */
export function calculateDirectPrepaidCompetence(
  input: DirectPrepaidCompetenceCalculationInput,
): DirectPrepaidCompetenceCalculation {
  const consumption = calculatePrepaidConsumption(input);

  if (consumption.status === "invalid") return consumption;

  return {
    status: "valid",
    calculatedCost: consumption.consumedValue,
    finalCost: applyMinimumFranchise(consumption.consumedValue, input.minimumFranchiseValue),
    totalBillableQuantity: input.sources.reduce(
      (total, source) => total + Math.max(source.clientBillableQuantity, 0),
      0,
    ),
  };
}
