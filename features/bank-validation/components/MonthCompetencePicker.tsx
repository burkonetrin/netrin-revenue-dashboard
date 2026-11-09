"use client";

/**
 * Seletor de mês de competência para relatórios de validação bancária.
 */

import { Select, SelectItem } from "@heroui/react";
import { useMemo } from "react";

interface MonthCompetencePickerProps {
  value: string;
  onChange: (value: string) => void;
}

interface ReferenceMonthOption {
  value: string;
  label: string;
}

function parseReferenceMonth(referenceMonth: string) {
  const [year, month] = referenceMonth.split("-").map(Number);

  if (!year || !month) {
    return new Date();
  }

  return new Date(year, month - 1, 1);
}

function formatReferenceMonth(date: Date) {
  const month = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
  }).format(date);

  const formattedMonth = `${month.charAt(0).toUpperCase()}${month.slice(1)}`;

  return `${formattedMonth} / ${date.getFullYear()}`;
}

function toReferenceMonth(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${date.getFullYear()}-${month}`;
}

function buildReferenceMonthOptions(selectedReferenceMonth: string): ReferenceMonthOption[] {
  const anchorDate = new Date();
  const options = Array.from({ length: 36 }, (_, index) => {
    const date = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - index, 1);

    return {
      value: toReferenceMonth(date),
      label: formatReferenceMonth(date),
    };
  });

  if (!options.some((option) => option.value === selectedReferenceMonth)) {
    const selectedDate = parseReferenceMonth(selectedReferenceMonth);

    options.push({
      value: selectedReferenceMonth,
      label: formatReferenceMonth(selectedDate),
    });
  }

  return options.sort((current, next) => next.value.localeCompare(current.value));
}

/**
 * Permite escolher o mês de referência entre as últimas competências disponíveis.
 */
export function MonthCompetencePicker({ value, onChange }: Readonly<MonthCompetencePickerProps>) {
  const options = useMemo(() => buildReferenceMonthOptions(value), [value]);

  return (
    <div className="flex w-[174px] flex-col gap-3">
      <p className="text-sm text-default-500">Mês de competência</p>

      <Select
        aria-label="Mês de competência"
        className="w-full"
        radius="sm"
        size="sm"
        selectedKeys={new Set([value])}
        selectionMode="single"
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string | undefined;

          if (selectedKey) {
            onChange(selectedKey);
          }
        }}
        classNames={{
          trigger: "h-[42px] rounded-xl border-0 bg-zinc-100 px-4 shadow-none",
          value: "text-sm text-gray-900!",
          selectorIcon: "text-default-900",
          popoverContent: "rounded-lg bg-white shadow-lg",
          listbox: "p-0 text-sm",
        }}
      >
        {options.map((option) => (
          <SelectItem key={option.value} textValue={option.label}>
            {option.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
