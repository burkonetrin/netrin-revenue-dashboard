import type { ColumnConfig } from "../DynamicTable/types";

/** Propriedades do seletor de colunas visíveis na tabela. */
export interface ColumnSelectorProps<T> {
  availableColumns: ColumnConfig<T>[];
  selectedColumns: string[];
  onChange: (columnIds: string[]) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}
