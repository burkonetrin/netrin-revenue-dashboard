"use client";

import { defaultSelectClassNames } from "@/shared/styles/inputClassNames";
import { Select, SelectItem } from "@heroui/react";
import { useMemo } from "react";
import { buildBillingMonthOptions } from "../utils/billing-month.utils";

interface BillingMonthSelectProps {
  label: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
}

/**
 * Seletor de mês de competência para filtros de faturamento.
 */
export function BillingMonthSelect({
  label,
  value,
  onChange,
  placeholder = "Selecione o mês",
}: BillingMonthSelectProps) {
  const options = useMemo(() => buildBillingMonthOptions(value ? [value] : []), [value]);

  return (
    <Select
      label={label}
      labelPlacement="outside"
      placeholder={placeholder}
      selectionMode="single"
      selectedKeys={value ? new Set([value]) : new Set()}
      onSelectionChange={(keys) => {
        if (keys === "all" || keys.size === 0) {
          onChange(undefined);
          return;
        }

        onChange(Array.from(keys)[0] as string);
      }}
      className="w-full"
      radius="sm"
      classNames={defaultSelectClassNames}
    >
      {options.map((option) => (
        <SelectItem key={option.value} textValue={option.label}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
}
