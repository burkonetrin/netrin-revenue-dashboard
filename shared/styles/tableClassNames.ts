/** Estilos de cabeçalho de tabela — espelham `DynamicTable` do Nucleus. */

export const nucleusTableHeadCellClass =
  "bg-gray-50 text-gray-700 font-semibold text-xs text-left px-4 h-12 border-b border-gray-200 align-middle";

export const nucleusTableHeadCellCenterClass =
  "bg-gray-50 text-gray-700 font-semibold text-xs text-center px-4 h-12 border-b border-gray-200 align-middle";

export const nucleusTableHeadCellCompactClass =
  "bg-gray-50 text-gray-700 font-semibold text-xs text-left px-2 h-10 border-b border-gray-200 align-middle";

export function nucleusSortableTableHeadCellClass(isActive: boolean) {
  return `${nucleusTableHeadCellClass} cursor-pointer select-none ${
    isActive ? "text-primary" : ""
  }`;
}
