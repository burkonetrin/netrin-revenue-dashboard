"use client";

import { Chip } from "@heroui/react";

export type SupportToolsFilterOption = { value: string; label: string };

export function SupportToolsFilterChips({
  values,
  options,
  onRemove,
}: {
  values: string[];
  options: SupportToolsFilterOption[];
  onRemove: (value: string) => void;
}) {
  if (values.length === 0) return null;

  const labelByValue = new Map(options.map((option) => [option.value, option.label]));

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {values.map((value) => (
        <Chip
          key={value}
          size="sm"
          variant="flat"
          radius="sm"
          onClose={() => onRemove(value)}
        >
          {labelByValue.get(value) ?? value}
        </Chip>
      ))}
    </div>
  );
}
