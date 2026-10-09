"use client";

import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { Search } from "lucide-react";
import { type Key, useEffect, useMemo, useState } from "react";
import { useDataSources } from "../hooks/useDataSources";
import type { ProviderType } from "../types/providers.types";
import {
  ProviderLinkedSourcesTable,
  type LinkedSourceRow,
} from "./ProviderLinkedSourcesTable";
import { SOURCE_SEARCH_DEBOUNCE_MS } from "./SourceSelectionSection";

export interface ProviderDirectSourcesSectionProps {
  providerType: ProviderType | "";
  linkedSources: LinkedSourceRow[];
  onLinkedSourcesChange: (sources: LinkedSourceRow[]) => void;
  showSourceError?: boolean;
}

/**
 * Seção Fontes fornecidas (busca + tabela) — visível só para Tipo=Direto (SUP-05).
 */
export function ProviderDirectSourcesSection({
  providerType,
  linkedSources,
  onLinkedSourcesChange,
  showSourceError = false,
}: ProviderDirectSourcesSectionProps) {
  const isDirect = providerType === "direct";
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
    { enabled: isDirect },
  );

  const selectedSourceIds = useMemo(
    () => new Set(linkedSources.map((s) => s.id)),
    [linkedSources],
  );

  const autocompleteItems = useMemo(() => {
    const sources = isDirect ? (sourcesResponse?.data ?? []) : [];
    return sources.filter((source) => !selectedSourceIds.has(source.id));
  }, [isDirect, sourcesResponse?.data, selectedSourceIds]);

  const handleSelectSource = (key: Key | null) => {
    if (!key) return;
    const id = String(key);
    if (selectedSourceIds.has(id)) return;
    const source = autocompleteItems.find((s) => s.id === id);
    if (!source) return;

    onLinkedSourcesChange([
      ...linkedSources,
      { id: source.id, name: source.name, defaultCost: "" },
    ]);
    setSourceSearchInput("");
  };

  if (!isDirect) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-default-700">Fontes fornecidas</p>

      <Autocomplete
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
      >
        {(source) => <AutocompleteItem key={source.id}>{source.name}</AutocompleteItem>}
      </Autocomplete>

      {showSourceError && linkedSources.length === 0 && (
        <p className="text-tiny text-danger">Selecione ao menos uma fonte</p>
      )}

      <ProviderLinkedSourcesTable
        sources={linkedSources}
        onChange={onLinkedSourcesChange}
      />
    </div>
  );
}
