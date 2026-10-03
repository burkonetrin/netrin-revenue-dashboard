import React from "react";

export interface DynamicTableSortDescriptor {
  column: string | number;
  direction: "ascending" | "descending";
}

export interface ColumnConfig<T> {
  id: keyof T | string;
  label: React.ReactNode;
  sortable?: boolean;
  align?: "start" | "center" | "end";
  width?: number;
  headerClassName?: string;
  cellClassName?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface DynamicTableProps<T> {
  columns: ColumnConfig<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
  width?: number;
  layout?: "auto" | "fixed";
  classNames?: {
    wrapper?: string;
    th?: string;
    td?: string;
    table?: string;
  };
  onRowClick?: (row: T) => void;
  isRowClickable?: (row: T) => boolean;
  sortDescriptor?: DynamicTableSortDescriptor;
  onSortChange?: (descriptor: DynamicTableSortDescriptor) => void;
  expandable?: boolean;
  expandColumnLabel?: string;
  expandedContent?: (row: T) => React.ReactNode;
  expandedRowKeys?: Set<string | number>;
  onExpandedChange?: (key: string | number, isExpanded: boolean) => void;
  isLoading?: boolean;
  disableRowHover?: boolean;
}
