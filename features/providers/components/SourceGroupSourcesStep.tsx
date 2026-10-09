"use client";

import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import {
  providerCompactTotalizerCardClass,
  providerCompactTotalizerLabelClass,
  providerCompactTotalizerValueClass,
  providerNativeTableHeadCellClass,
} from "@/features/providers/utils/providersTableColumns.shared";
import { formatCurrency } from "@/shared/utils/currency";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { Search, Trash2 } from "lucide-react";
import { type Key, useEffect, useMemo, useState } from "react";
import { useDataSources } from "../hooks/useDataSources";
import type { SourceGroupFormSource } from "../types/data-source-bundles.types";
import { toSourceGroupFormSourceFromDataSource } from "../utils/sourceGroupFormSource.utils";
import { SOURCE_SEARCH_DEBOUNCE_MS } from "./SourceSelectionSection";

export type SourceSelectionEntityLabel = "grupo" | "modelo";

interface SourceGroupSourcesStepProps {
  selectedSources: SourceGroupFormSource[];
  onSelectedSourcesChange: (sources: SourceGroupFormSource[]) => void;
  showSourceError?: boolean;
  /** Texto da entidade nos labels (ex.: grupo, modelo). */
  entityLabel?: SourceSelectionEntityLabel;
  /** Filtra fontes pelo tipo de consulta do modelo BGC. */
  consultationType?: string;
}

export function SourceGroupSourcesStep({
  selectedSources,
  onSelectedSourcesChange,
  showSourceError = false,
  entityLabel = "grupo",
  consultationType,
}: SourceGroupSourcesStepProps) {
  const [sourceSearchInput, setSourceSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(sourceSearchInput.trim());
    }, SOURCE_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [sourceSearchInput]);

  const { data: sourcesResponse, isLoading: isSourcesSearchLoading } =
    useDataSources({
      search: debouncedSearch || undefined,
      pageSize: 20,
      isActive: true,
      consultationType: consultationType || undefined,
    });

  const selectedSourceIds = useMemo(
    () => new Set(selectedSources.map((s) => s.id)),
    [selectedSources],
  );

  const autocompleteItems = useMemo(() => {
    const sources = sourcesResponse?.data ?? [];
    return sources.filter((source) => !selectedSourceIds.has(source.id));
  }, [sourcesResponse?.data, selectedSourceIds]);

  const handleSelectSource = (key: Key | null) => {
    if (!key) return;
    const id = String(key);
    const source = autocompleteItems.find((s) => s.id === id);
    if (!source || selectedSourceIds.has(id)) return;

    onSelectedSourcesChange([
      ...selectedSources,
      toSourceGroupFormSourceFromDataSource(source),
    ]);
    setSourceSearchInput("");
  };

  const handleRemoveSource = (sourceId: string) => {
    onSelectedSourcesChange(
      selectedSources.filter((s) => s.id !== sourceId),
    );
  };

  const sourceCount = selectedSources.length;
  const totalReferenceCost = selectedSources.reduce(
    (sum, s) => sum + s.referenceCost,
    0,
  );
  const totalRealCost = selectedSources.reduce(
    (sum, s) => sum + s.realCost,
    0,
  );

  return (
    <div className="flex flex-col gap-6 font-sans min-w-0">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-zinc-500">
          Adicionar fontes ao {entityLabel}
          <span className="text-danger"> *</span>
        </p>
        <Autocomplete
          aria-label={`Adicionar fontes ao ${entityLabel}`}
          labelPlacement="outside"
          placeholder="Pesquise por fonte"
          inputValue={sourceSearchInput}
          onInputChange={setSourceSearchInput}
          selectedKey={null}
          onSelectionChange={handleSelectSource}
          isLoading={isSourcesSearchLoading}
          items={autocompleteItems}
          allowsCustomValue={false}
          inputProps={{
            classNames: defaultInputClassNames,
            startContent: <Search size={18} className="text-default-400" />,
          }}
          endContent={<Search size={18} className="text-default-400" />}
        >
          {(source) => (
            <AutocompleteItem key={source.id}>{source.name}</AutocompleteItem>
          )}
        </Autocomplete>
        {showSourceError && sourceCount === 0 && (
          <p className="text-tiny text-danger">Selecione ao menos uma fonte</p>
        )}
      </div>

      <div className="overflow-hidden rounded-lg">
        <table className="w-full table-fixed text-xs">
          <thead>
            <tr>
              <th className={`w-[38%] whitespace-nowrap ${providerNativeTableHeadCellClass}`}>
                Fontes ({sourceCount})
              </th>
              <th className={`w-[28%] whitespace-nowrap ${providerNativeTableHeadCellClass}`}>
                Custo de referência
              </th>
              <th className={`w-[24%] whitespace-nowrap ${providerNativeTableHeadCellClass}`}>
                Custo real
              </th>
              <th
                className={`w-[10%] whitespace-nowrap ${providerNativeTableHeadCellClass}`}
                aria-label="Remover fonte"
              />
            </tr>
          </thead>
          <tbody>
            {sourceCount === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-default-400 border-b border-gray-200"
                >
                  Nenhuma fonte adicionada
                </td>
              </tr>
            ) : (
              selectedSources.map((source) => (
                <tr key={source.id} className="border-b border-gray-200">
                  <td className="px-4 py-3 text-xs text-gray-900">{source.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-900">
                    {formatCurrency(source.referenceCost)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-900">
                    {formatCurrency(source.realCost)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveSource(source.id)}
                      className="text-danger hover:text-danger-600 p-1 rounded-full hover:bg-danger-50 transition-all cursor-pointer inline-flex"
                      aria-label={`Remover ${source.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className={providerCompactTotalizerCardClass}>
          <p className={providerCompactTotalizerLabelClass}>Custo de referência total</p>
          <p className={providerCompactTotalizerValueClass}>
            {formatCurrency(totalReferenceCost)}
          </p>
        </div>
        <div className={providerCompactTotalizerCardClass}>
          <p className={providerCompactTotalizerLabelClass}>Custo real total</p>
          <p className={providerCompactTotalizerValueClass}>
            {formatCurrency(totalRealCost)}
          </p>
        </div>
      </div>
    </div>
  );
}
