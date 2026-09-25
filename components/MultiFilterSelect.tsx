"use client";

import { Select, SelectItem } from "@heroui/react";
import { useMemo } from "react";

export interface MultiFilterOption {
  key: string;
  label: string;
}

interface MultiFilterSelectProps {
  label: string;
  options: MultiFilterOption[];
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
  className?: string;
}

const ALL_KEY = "todos";

/**
 * Multi-select com opção "Todos" como primeiro item (protótipo).
 */
export function MultiFilterSelect({
  label,
  options,
  selectedKeys,
  onChange,
  className,
}: MultiFilterSelectProps) {
  const items = useMemo(
    () => [{ key: ALL_KEY, label: "Todos" }, ...options],
    [options],
  );

  const handleChange = (keys: "all" | Set<React.Key>) => {
    if (keys === "all") {
      onChange([ALL_KEY]);
      return;
    }
    const next = Array.from(keys).map(String);
    if (next.length === 0 || next.includes(ALL_KEY)) {
      onChange([ALL_KEY]);
      return;
    }
    onChange(next.filter((k) => k !== ALL_KEY));
  };

  const value =
    selectedKeys.length === 0 || selectedKeys.includes(ALL_KEY)
      ? [ALL_KEY]
      : selectedKeys;

  return (
    <Select
      label={label}
      selectionMode="multiple"
      selectedKeys={new Set(value)}
      onSelectionChange={handleChange}
      className={className ?? "min-w-[200px] max-w-xs"}
      size="sm"
      aria-label={label}
    >
      {items.map((item) => (
        <SelectItem key={item.key}>{item.label}</SelectItem>
      ))}
    </Select>
  );
}
