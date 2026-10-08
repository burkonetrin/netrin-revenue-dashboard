"use client";

import { defaultSelectClassNames } from "@/shared/styles/inputClassNames";
import { Select, SelectItem } from "@heroui/react";
import { useState } from "react";
import {
  SupportToolsFilterChips,
  type SupportToolsFilterOption,
} from "./SupportToolsFilterChips";
import { SupportToolsFilterField } from "./SupportToolsFilterField";

export function SupportToolsMultiSelectFilter({
  label,
  ariaLabel,
  placeholder,
  options,
  values,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  placeholder?: string;
  options: SupportToolsFilterOption[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [resetKey, setResetKey] = useState(0);
  const availableOptions = options.filter((option) => !values.includes(option.value));

  const addValue = (value: string) => {
    if (!value || values.includes(value)) return;
    onChange([...values, value]);
    setResetKey((current) => current + 1);
  };

  return (
    <SupportToolsFilterField label={label}>
      <Select
        key={resetKey}
        aria-label={ariaLabel}
        placeholder={placeholder ?? "Selecione"}
        selectedKeys={new Set()}
        onSelectionChange={(keys) => {
          if (keys === "all" || keys.size === 0) return;
          addValue(Array.from(keys)[0] as string);
        }}
        radius="sm"
        className="w-full"
        classNames={defaultSelectClassNames}
        isDisabled={availableOptions.length === 0}
      >
        {availableOptions.map((option) => (
          <SelectItem key={option.value}>{option.label}</SelectItem>
        ))}
      </Select>
      <SupportToolsFilterChips
        values={values}
        options={options}
        onRemove={(value) => onChange(values.filter((item) => item !== value))}
      />
    </SupportToolsFilterField>
  );
}
