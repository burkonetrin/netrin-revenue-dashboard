"use client";

import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { Search, Trash2, X } from "lucide-react";
import { type Key, type ReactNode, useEffect, useMemo, useState } from "react";
import { useDataSources } from "../hooks/useDataSources";

/** Debounce (ms) da busca de fontes individuais. */
export const SOURCE_SEARCH_DEBOUNCE_MS = 300;

/** Fonte individual selecionada na seção de vínculo. */
export interface SelectedSourceItem {
  id: string;
  name: string;
}

interface SourceSelectionSectionProps {
  title: ReactNode;
  selectedSources: SelectedSourceItem[];
  onSelectedSourcesChange: (sources: SelectedSourceItem[]) => void;
  showSearchClearButton?: boolean;
  listItemClassName?: string;
  endContent?: ReactNode;
  showSourceError?: boolean;
  enabled?: boolean;
}

/**
 * Seção reutilizável de busca e seleção de fontes individuais.
 */
export function SourceSelectionSection({
  title,
  selectedSources,
  onSelectedSourcesChange,
  showSearchClearButton = false,
  listItemClassName = "flex items-center justify-between rounded-lg border border-default-200 bg-white px-4 py-3",
  endContent,
  showSourceError = false,
  enabled = true,
}: SourceSelectionSectionProps) {
  const [sourceSearchInput, setSourceSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(sourceSearchInput.trim());
    }, SOURCE_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [sourceSearchInput]);

  const { data: sourcesResponse, isLoading: isSourcesSearchLoading } = useDataSources(
    {
      search: debouncedSearch || undefined,
      pageSize: 20,
      isActive: true,
    },
    { enabled },
  );

  const selectedSourceIds = useMemo(
    () => new Set(selectedSources.map((s) => s.id)),
    [selectedSources],
  );

  const autocompleteItems = useMemo(() => {
    const sources = enabled ? (sourcesResponse?.data ?? []) : [];
    return sources.filter((source) => !selectedSourceIds.has(source.id));
  }, [enabled, sourcesResponse?.data, selectedSourceIds]);

  const handleSelectSource = (key: Key | null) => {
    if (!key) return;
    const id = String(key);
    const source = autocompleteItems.find((s) => s.id === id);
    if (!source || selectedSourceIds.has(id)) return;

    onSelectedSourcesChange([...selectedSources, { id: source.id, name: source.name }]);
    setSourceSearchInput("");
  };

  const handleRemoveSource = (sourceId: string) => {
    onSelectedSourcesChange(selectedSources.filter((s) => s.id !== sourceId));
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-default-700">{title}</p>

      <Autocomplete
        labelPlacement="outside"
        placeholder="Pesquise por fonte"
        inputValue={sourceSearchInput}
        onInputChange={setSourceSearchInput}
        selectedKey={null}
        onSelectionChange={handleSelectSource}
        isLoading={isSourcesSearchLoading}
        isDisabled={!enabled}
        items={autocompleteItems}
        allowsCustomValue={false}
        inputProps={{
          classNames: defaultInputClassNames,
          startContent: <Search size={18} className="text-default-400" />,
          endContent:
            showSearchClearButton && sourceSearchInput ? (
              <button
                type="button"
                onClick={() => setSourceSearchInput("")}
                className="text-default-400 hover:text-default-600 p-0.5 rounded-full cursor-pointer"
                aria-label="Limpar busca"
              >
                <X size={16} />
              </button>
            ) : null,
        }}
        endContent={
          showSearchClearButton
            ? undefined
            : (endContent ?? <Search size={18} className="text-default-400" />)
        }
      >
        {(source) => <AutocompleteItem key={source.id}>{source.name}</AutocompleteItem>}
      </Autocomplete>

      {showSourceError && selectedSources.length === 0 && (
        <p className="text-tiny text-danger">Selecione ao menos uma fonte</p>
      )}

      {selectedSources.length > 0 && (
        <ul className="flex flex-col gap-2">
          {selectedSources.map((source) => (
            <li key={source.id} className={listItemClassName}>
              <span className="text-sm font-medium text-default-800">{source.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveSource(source.id)}
                className="text-danger hover:text-danger-600 p-1 rounded-full hover:bg-danger-50 transition-all cursor-pointer"
                aria-label={`Remover ${source.name}`}
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
