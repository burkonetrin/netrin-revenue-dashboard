"use client";

import { Checkbox, Input, Radio, RadioGroup } from "@heroui/react";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  PreviewConsultationType,
  PreviewSourceOption,
  PreviewSourceSelection,
} from "../types/backgroundCheckTemplatePreview.types";
import { providerNativeTableHeadCellClass } from "@/features/providers/utils/providersTableColumns.shared";
import { formatReferenceCostDisplay } from "../utils/referenceCost";

export type SourceSelectionProps = {
  sources: PreviewSourceOption[];
  consultationType: PreviewConsultationType | "";
  selections: PreviewSourceSelection[];
  onSelectionsChange: (selections: PreviewSourceSelection[]) => void;
  title?: string;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  minimumFractionDigits: 2,
  style: "currency",
});

function formatCost(value: number | null) {
  return value === null ? "-" : currencyFormatter.format(value);
}

function includesQuery(value: string | undefined, query: string) {
  return Boolean(value?.toLocaleLowerCase().includes(query));
}

export function SourceSelection({
  sources,
  consultationType,
  selections,
  onSelectionsChange,
  title = "Seleção de fontes",
}: SourceSelectionProps) {
  const [search, setSearch] = useState("");
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const query = search.trim().toLocaleLowerCase();
  const selectedSourceIds = useMemo(
    () => new Set(selections.map((selection) => selection.sourceId)),
    [selections],
  );

  useEffect(() => {
    if (selections.length === 0 && showSelectedOnly) {
      setShowSelectedOnly(false);
    }
  }, [selections.length, showSelectedOnly]);

  const visibleSources = useMemo(
    () =>
      sources.filter((source) => {
        if (consultationType && !source.consultationTypes.includes(consultationType)) {
          return false;
        }
        if (showSelectedOnly && !selectedSourceIds.has(source.id)) {
          return false;
        }
        if (!query) return true;

        return (
          includesQuery(source.name, query) ||
          includesQuery(source.internalName, query) ||
          source.providers.some((provider) => includesQuery(provider.name, query))
        );
      }),
    [consultationType, query, selectedSourceIds, showSelectedOnly, sources],
  );

  const toggleSource = (sourceId: string, isSelected: boolean) => {
    if (isSelected) {
      if (!selectedSourceIds.has(sourceId)) {
        onSelectionsChange([...selections, { sourceId, providerId: null }]);
      }
      return;
    }

    onSelectionsChange(selections.filter((selection) => selection.sourceId !== sourceId));
  };

  const selectProvider = (sourceId: string, providerId: string) => {
    onSelectionsChange(
      selections.map((selection) =>
        selection.sourceId === sourceId ? { ...selection, providerId } : selection,
      ),
    );
  };

  const isAllSourcesSelected =
    visibleSources.length > 0 && visibleSources.every((source) => selectedSourceIds.has(source.id));

  const toggleAllSources = (isSelected: boolean) => {
    if (!isSelected) {
      const visibleSourceIds = new Set(visibleSources.map((source) => source.id));
      onSelectionsChange(
        selections.filter((selection) => !visibleSourceIds.has(selection.sourceId)),
      );
      return;
    }

    const nextSelections = [...selections];
    for (const source of visibleSources) {
      if (!selectedSourceIds.has(source.id)) {
        nextSelections.push({ sourceId: source.id, providerId: null });
      }
    }
    onSelectionsChange(nextSelections);
  };

  return (
    <section
      className="flex min-w-0 flex-col gap-4 rounded-xl border border-default-200 p-5"
      aria-label="Seleção de fontes"
    >
      <h2 className="text-xl font-semibold text-zinc-600 mb-2">{title}</h2>
      <div className="flex justify-between items-center gap-3">
        <Input
          aria-label="Pesquisar fontes e fornecedores"
          className="min-w-0 max-w-2xs flex-1 text-sm"
          placeholder="Pesquise por fonte ou fornecedor"
          value={search}
          onValueChange={setSearch}
          startContent={<Search size={18} className="text-default-400" />}
        />
        <button
          type="button"
          aria-label="Mostrar apenas fontes selecionadas"
          aria-pressed={showSelectedOnly}
          disabled={selections.length === 0}
          onClick={() => setShowSelectedOnly((isActive) => !isActive)}
          className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
            showSelectedOnly ? "bg-[#0EA5E9] text-white" : "bg-blue-100 text-[#0EA5E9]"
          } ${selections.length === 0 ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
        >
          {selections.length} selecionadas
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-lg border border-default-200 p-3">
          <Checkbox
            isSelected={isAllSourcesSelected}
            isDisabled={visibleSources.length === 0}
            onValueChange={toggleAllSources}
            classNames={{ label: "text-sm font-medium text-default-800" }}
          >
            Marcar todas
          </Checkbox>
          <span className="text-xs text-default-500">
            {visibleSources.length} fontes encontradas
          </span>
        </div>
        {visibleSources.length === 0 ? (
          <p className="text-sm text-default-500">Nenhuma fonte encontrada</p>
        ) : (
          visibleSources.map((source) => {
            const selection = selections.find((item) => item.sourceId === source.id);
            const isSelected = Boolean(selection);

            return (
              <div
                key={source.id}
                className="flex flex-col justify-between rounded-lg border border-default-200 p-3"
              >
                <div>
                  <Checkbox
                    aria-label={`Selecionar fonte ${source.name}`}
                    isSelected={isSelected}
                    onValueChange={(checked) => toggleSource(source.id, checked)}
                    classNames={{ label: "text-sm font-medium text-default-800" }}
                  >
                    {source.name}
                  </Checkbox>
                  <p className="text-xs text-default-500">
                    Custo de referência: {formatReferenceCostDisplay(source.referenceCost)}
                  </p>
                </div>
                {isSelected && (
                  <div className="mt-3">
                    <RadioGroup
                      aria-label={`Fornecedor da fonte ${source.name}`}
                      value={selection?.providerId ?? ""}
                      onValueChange={(providerId) => selectProvider(source.id, providerId)}
                    >
                      <table className="w-full table-fixed text-xs">
                        <thead>
                          <tr>
                            <th
                              className={`w-[44%] whitespace-nowrap ${providerNativeTableHeadCellClass}`}
                            >
                              Fornecedor
                            </th>
                            <th
                              className={`w-[26%] whitespace-nowrap ${providerNativeTableHeadCellClass}`}
                            >
                              Custo real (R$)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {source.providers.map((provider) => (
                            <tr
                              key={provider.id}
                              className="border-b border-default-100 last:border-0"
                            >
                              <td className="wrap-break-word px-2 py-2">
                                <Radio value={provider.id} classNames={{ label: "text-xs" }}>
                                  {provider.name}
                                </Radio>
                              </td>
                              <td className="px-2 py-2 text-xs">{formatCost(provider.realCost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </RadioGroup>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
