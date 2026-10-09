import { formatCurrency } from "@/shared/utils/currency";
import { DirectProviderInvoiceTotals } from "./DirectProviderInvoiceTotals";

export interface DirectPrepaidCompetenceTotalsProps {
  totalBillableQuantity: number;
  calculatedCost: string;
  informedSourcesCost: string;
}

/** Presents the three Figma totalizers without applying business rules. */
export function DirectPrepaidCompetenceTotals({
  totalBillableQuantity,
  calculatedCost,
  informedSourcesCost,
}: DirectPrepaidCompetenceTotalsProps) {
  return (
    <DirectProviderInvoiceTotals
      items={[
        {
          label: "Total de consultas bilhetadas",
          value: totalBillableQuantity,
          testId: "direct-prepaid-billable-total",
        },
        {
          label: "Custo calculado",
          value: formatCurrency(calculatedCost),
          testId: "direct-prepaid-calculated-cost",
        },
        {
          label: "Custo informado das fontes",
          value: formatCurrency(informedSourcesCost),
          testId: "direct-prepaid-informed-sources-cost",
        },
      ]}
    />
  );
}
