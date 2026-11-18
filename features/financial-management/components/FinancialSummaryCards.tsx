import { Tooltip } from "@heroui/react";
import { ChevronDown, ChevronUp, Info, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import type { CostManagementSummary } from "../types/costManagement.types";
import {
  formatCount,
  formatCurrency,
  formatDecimal,
  formatPercent,
  getVariationPresentation,
} from "../utils/financialFormatters";

interface FinancialSummaryCardsProps {
  summary: CostManagementSummary;
  showVariations?: boolean;
  headerEndContent?: ReactNode;
}

interface SummaryCardDefinition {
  label: string;
  value: string | number | null | undefined;
  variation: string | null | undefined;
  kind: "currency" | "count" | "percent" | "decimal";
  secondaryValue?: string | number | null | undefined;
  secondarySuffix?: string;
  note?: string;
  unallocatedCost?: string | number | null | undefined;
  manualInvoiceRevenue?: string | null;
}

function formatValue(
  value: string | number | null | undefined,
  kind: SummaryCardDefinition["kind"],
) {
  if (value === null || value === undefined) return "—";
  if (kind === "count") return formatCount(Number(value));
  if (kind === "decimal") return formatDecimal(String(value)) ?? "—";
  if (kind === "percent") return formatPercent(String(value)) ?? "—";
  return formatCurrency(String(value)) ?? "—";
}

export function FinancialSummaryCards({
  summary,
  showVariations = true,
  headerEndContent,
}: FinancialSummaryCardsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { totals } = summary;
  const cards: SummaryCardDefinition[] = [
    {
      label: "Custo total",
      value: totals.cost,
      variation: totals.costVariationPercent,
      kind: "currency",
      secondaryValue: totals.unitCost,
      secondarySuffix: " un.",
    },
    {
      label: "Custo de fornecedores indiretos",
      value: summary.indirectProviderCost,
      variation: summary.indirectProviderCostVariationPercent,
      kind: "currency",
      note: summary.indirectProviderCostNote,
      unallocatedCost: summary.unallocatedIndirectProviderCost,
    },
    {
      label: "Receita",
      value: totals.revenue,
      variation: totals.revenueVariationPercent,
      kind: "currency",
      secondaryValue: totals.unitRevenue,
      secondarySuffix: " un.",
      manualInvoiceRevenue: totals.manualInvoiceRevenue,
    },
    {
      label: "Margem",
      value: totals.directMargin,
      variation: totals.directMarginVariationPercent,
      kind: "currency",
      secondaryValue: totals.directMarginPercent,
      secondarySuffix: "%",
    },
    {
      label: "Bilhetadas",
      value: totals.billableConsultations,
      variation: totals.billableConsultationsVariationPercent,
      kind: "count",
    },
    {
      label: "Não bilhetadas",
      value: totals.nonBillableConsultations,
      variation: totals.nonBillableConsultationsVariationPercent,
      kind: "count",
    },
    {
      label: "Cache",
      value: totals.cacheConsultations,
      variation: totals.cacheConsultationsVariationPercent,
      kind: "count",
    },
    {
      label: "Markup",
      value: totals.markup,
      variation: totals.markupVariationPercent,
      kind: "decimal",
    },
  ];

  return (
    <section aria-label="Resumo financeiro" className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls="financial-summary-cards"
          className="flex cursor-pointer items-center gap-2 text-sm font-medium text-default-700"
          onClick={() => setIsExpanded((current) => !current)}
        >
          <span>Valores totais</span>
          {isExpanded ? <ChevronUp size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
        </button>
        {headerEndContent}
      </div>
      {isExpanded ? (
        <div id="financial-summary-cards" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <SummaryCard key={card.label} card={card} showVariation={showVariations} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SummaryCard({
  card,
  showVariation,
}: { card: SummaryCardDefinition; showVariation: boolean }) {
  const presentation = getVariationPresentation(card.variation ?? null);
  const variation = formatPercent(card.variation ?? null);
  const isIncrease = presentation === "increase";
  const manualRevenueValue =
    card.manualInvoiceRevenue === null || card.manualInvoiceRevenue === undefined
      ? null
      : Number(card.manualInvoiceRevenue);
  const hasManualInvoiceRevenue =
    manualRevenueValue !== null && Number.isFinite(manualRevenueValue) && manualRevenueValue > 0;

  return (
    <article
      aria-label={card.label}
      className="relative min-h-[72px] rounded-lg px-4 py-3"
      style={{ backgroundColor: "#f0f9ff" }}
    >
      <div className="pr-8">
        <div className="flex items-center gap-2 text-xs text-default-600">
          <span className="whitespace-nowrap">{card.label}</span>
          {showVariation && presentation !== "hidden" && variation ? (
            <span
              className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-medium ${isIncrease ? "text-success-600" : "text-danger-500"}`}
            >
              {isIncrease ? (
                <TrendingUp size={15} aria-hidden />
              ) : (
                <TrendingDown size={15} aria-hidden />
              )}
              {variation}
            </span>
          ) : null}
        </div>
        <div className="mt-1 flex items-baseline gap-2 text-xl font-medium text-default-800">
          <strong className="font-medium">{formatValue(card.value, card.kind)}</strong>
          {card.secondaryValue !== null && card.secondaryValue !== undefined ? (
            <span className="whitespace-nowrap">
              |{" "}
              {card.secondarySuffix === "%"
                ? formatPercent(String(card.secondaryValue))
                : `${formatCurrency(String(card.secondaryValue))}${card.secondarySuffix ?? ""}`}
            </span>
          ) : null}
        </div>
      </div>
      {card.note || hasManualInvoiceRevenue ? (
        <Tooltip
          content={
            card.note ? (
              <div
                className="py-1 text-sm leading-5 text-default-900"
                style={{ maxWidth: "294px" }}
              >
                <p>{card.note}</p>
                <p>
                  Custo não rateado:{" "}
                  {formatCurrency(
                    card.unallocatedCost === null || card.unallocatedCost === undefined
                      ? null
                      : String(card.unallocatedCost),
                  ) ?? "—"}
                </p>
              </div>
            ) : (
              `Faturas manuais incluídas na receita: ${formatCurrency(String(card.manualInvoiceRevenue))}`
            )
          }
          placement="top"
          showArrow
          radius="md"
        >
          <button
            type="button"
            aria-label={
              card.note
                ? `Informações sobre ${card.label}`
                : "Informações sobre faturas manuais incluídas na receita"
            }
            className="absolute right-3 top-3 shrink-0"
            style={{ color: "#00a3ff" }}
          >
            <Info size={24} aria-hidden />
          </button>
        </Tooltip>
      ) : null}
    </article>
  );
}
