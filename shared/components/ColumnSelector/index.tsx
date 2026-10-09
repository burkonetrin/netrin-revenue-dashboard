"use client";

import { Select, SelectItem } from "@heroui/react";
import type { ColumnSelectorProps } from "./types";

export function ColumnSelector<T>({
  availableColumns,
  selectedColumns,
  onChange,
  placeholder = "Selecione as colunas",
  className = "max-w-xs",
}: ColumnSelectorProps<T>) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-sm text-default-500">Colunas</div>
      <Select
        placeholder={placeholder}
        selectionMode="multiple"
        size="md"
        selectedKeys={new Set(selectedColumns)}
        onSelectionChange={(keys) => {
          const selectedArray = Array.from(keys) as string[];
          onChange(selectedArray);
        }}
        className={className}
        classNames={{
          trigger:
            "bg-zinc-100 border border-default-200! hover:border-primary-100! rounded-lg data-[focus=true]:border-primary-100! data-[focus=true]:outline data-[focus=true]:outline-3 data-[focus=true]:outline-primary-50 data-[focus=true]:outline-offset-0 data-[open=true]:border-primary-100! data-[open=true]:outline data-[open=true]:outline-3 data-[open=true]:outline-primary-50 data-[open=true]:outline-offset-0",
          value: "text-default-500! text-sm",
          popoverContent: "bg-white shadow-lg",
          listbox: "p-0 text-xs!",
          listboxWrapper: "max-h-[400px] text-xs!",
          label: "text-sm text-default-500!",
        }}
      >
        {availableColumns.map((col) => (
          <SelectItem key={col.id as string}>{col.label}</SelectItem>
        ))}
      </Select>
    </div>
  );
}
