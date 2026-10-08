"use client";

import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useMemo, useState } from "react";
import { SupportToolsFilterChips } from "./SupportToolsFilterChips";

type SuggestionItem = { key: string; label: string };

export function SupportToolsFilterAutocomplete({
  ariaLabel,
  selectedValues,
  onSelectedValuesChange,
  suggestions,
  placeholder,
}: {
  ariaLabel: string;
  selectedValues: string[];
  onSelectedValuesChange: (values: string[]) => void;
  suggestions: string[];
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const items = useMemo((): SuggestionItem[] => {
    const query = inputValue.trim().toLowerCase();
    const unique = [...new Set(suggestions.map((item) => item.trim()).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b, "pt-BR"),
    );
    const filtered = query
      ? unique.filter((item) => item.toLowerCase().includes(query))
      : unique;
    return filtered
      .filter((label) => !selectedValues.includes(label))
      .map((label) => ({ key: label, label }));
  }, [inputValue, selectedValues, suggestions]);

  const chipOptions = useMemo(
    () => selectedValues.map((value) => ({ value, label: value })),
    [selectedValues],
  );

  const addSelection = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || selectedValues.includes(trimmed)) return;
    onSelectedValuesChange([...selectedValues, trimmed]);
    setInputValue("");
  };

  return (
    <div>
      <Autocomplete
        aria-label={ariaLabel}
        placeholder={placeholder}
        allowsCustomValue
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSelectionChange={(key) => {
          if (!key) return;
          addSelection(String(key));
        }}
        menuTrigger="input"
        radius="sm"
        className="w-full"
        items={items}
        inputProps={{
          classNames: defaultInputClassNames,
        }}
      >
        {(item) => (
          <AutocompleteItem key={item.key} textValue={item.label}>
            {item.label}
          </AutocompleteItem>
        )}
      </Autocomplete>
      <SupportToolsFilterChips
        values={selectedValues}
        options={chipOptions}
        onRemove={(value) =>
          onSelectedValuesChange(selectedValues.filter((item) => item !== value))
        }
      />
    </div>
  );
}
