"use client";

import type {
  PreviewProviderOption,
  PreviewSourceOption,
  PreviewSourceSelection,
} from "../types/backgroundCheckTemplatePreview.types";
import { providerNativeTableHeadCellClass } from "@/features/providers/utils/providersTableColumns.shared";
import { formatReferenceCostDisplay, sumEligibleReferenceCosts } from "../utils/referenceCost";

export type SourceSelectionSummaryProps = {
  sources: PreviewSourceOption[];
  selections: PreviewSourceSelection[];
  title?: string;
};

type SummaryGroup = {
  key: string;
  name: string;
  items: Array<{
    source: PreviewSourceOption;
    provider: PreviewProviderOption;
  }>;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  minimumFractionDigits: 2,
  style: "currency",
});

function formatCost(value: number | null) {
  return value === null ? "-" : currencyFormatter.format(value);
}

function sumCosts(values: Array<number | null>) {
  const definedValues = values.filter((value): value is number => value !== null);
  return definedValues.length > 0 ? definedValues.reduce((total, value) => total + value, 0) : null;
}

function buildSummaryGroups(sources: PreviewSourceOption[], selections: PreviewSourceSelection[]) {
  const groups = new Map<string, SummaryGroup>();

  for (const selection of selections) {
    if (!selection.providerId) continue;

    const source = sources.find((item) => item.id === selection.sourceId);
    if (!source) continue;

    const provider = source.providers.find((item) => item.id === selection.providerId);
    if (!provider) continue;

    const providerName = provider.name;
    const key = providerName.trim().toLocaleLowerCase() || "fornecedor-nao-selecionado";
    const group = groups.get(key) ?? { key, name: providerName, items: [] };

    group.items.push({ source, provider });
    groups.set(key, group);
  }

  return Array.from(groups.values());
}

function eligibleSourceReferenceCost(source: PreviewSourceOption) {
  if (source.isActive === false) return null;
  return source.referenceCost;
}

function SummaryProviderTable({ group }: { group: SummaryGroup }) {
  const referenceCostTotal = sumEligibleReferenceCosts(
    group.items.map(({ source }) => eligibleSourceReferenceCost(source)),
  );
  const realCostTotal = sumCosts(group.items.map(({ provider }) => provider?.realCost ?? null));

  return (
    <div className="overflow-hidden rounded-lg">
      <table className="w-full table-fixed text-xs">
        <thead>
          <tr>
            <th className={`w-[42%] whitespace-nowrap ${providerNativeTableHeadCellClass}`}>
              Fontes
            </th>
            <th className={`w-[34%] whitespace-nowrap ${providerNativeTableHeadCellClass}`}>
              Custo de referência
            </th>
            <th className={`w-[24%] whitespace-nowrap ${providerNativeTableHeadCellClass}`}>
              Custo real
            </th>
          </tr>
        </thead>
        <tbody>
          {group.items.map(({ source, provider }) => (
            <tr key={source.id} className="border-b border-default-100">
              <td className="break-words px-2 py-3 text-default-800">{source.name}</td>
              <td className="px-2 py-3 text-default-800">
                {formatReferenceCostDisplay(source.referenceCost)}
              </td>
              <td className="px-2 py-3 text-default-800">
                {formatCost(provider?.realCost ?? null)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-default-50 text-default-800">
            <td className="px-2 py-3 font-medium">Total</td>
            <td className="px-2 py-3 font-medium">
              {formatReferenceCostDisplay(referenceCostTotal)}
            </td>
            <td className="px-2 py-3 font-medium">{formatCost(realCostTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function SourceSelectionSummary({
  sources,
  selections,
  title = "Resumo do modelo",
}: SourceSelectionSummaryProps) {
  const groups = buildSummaryGroups(sources, selections);
  const totalReferenceCost = sumEligibleReferenceCosts(
    groups.flatMap((group) => group.items.map(({ source }) => eligibleSourceReferenceCost(source))),
  );
  const totalRealCost = sumCosts(
    groups.flatMap((group) => group.items.map(({ provider }) => provider?.realCost ?? null)),
  );

  return (
    <section
      className="flex min-w-0 flex-col gap-4 rounded-xl border border-default-200 p-5"
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="mb-2 text-xl font-semibold text-zinc-600">{title}</h2>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-default-500">Ainda não foi selecionada nenhuma fonte</p>
      ) : (
        <>
          <div className="flex flex-col gap-5">
            {groups.map((group) => (
              <div key={group.key} className="flex flex-col gap-2">
                <p className="text-sm font-medium text-default-800">{group.name}</p>
                <SummaryProviderTable group={group} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-lg bg-sky-100 px-4 py-4 sm:grid-cols-2">
            <div>
              <p className="text-base font-medium text-zinc-600">Custo de referência total</p>
              <p className="mt-1 text-sm text-zinc-500">
                {formatReferenceCostDisplay(totalReferenceCost)}
              </p>
            </div>
            <div>
              <p className="text-base font-medium text-zinc-600">Custo real total</p>
              <p className="mt-1 text-sm text-zinc-500">{formatCost(totalRealCost)}</p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
