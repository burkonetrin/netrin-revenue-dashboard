"use client";

import { Chip } from "@heroui/react";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";

export function renderActiveStatusChip(
  value: boolean,
  labels: { active: string; inactive: string } = {
    active: "ativo",
    inactive: "inativo",
  },
) {
  return (
    <Chip
      size="sm"
      variant="flat"
      color={value ? "success" : "danger"}
      className={
        value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }
    >
      {value ? labels.active : labels.inactive}
    </Chip>
  );
}

export function buildBooleanStatusColumn<T>(options?: {
  id?: string;
  label?: string;
  width?: number;
  sortable?: boolean;
}): ColumnConfig<T> {
  return {
    id: options?.id ?? "isActive",
    label: options?.label ?? "Status",
    width: options?.width,
    sortable: options?.sortable,
    render: (value) =>
      renderActiveStatusChip(Boolean(value), {
        active: "Ativo",
        inactive: "Inativo",
      }),
  };
}
