/** Estilos de cabeçalho de tabela — espelham `DynamicTable` do Nucleus (HeroUI). */

const nucleusTableHeadRounded =
  "[&:first-child]:rounded-s-lg [&:last-child]:rounded-e-lg";

export const nucleusNativeTableClassName =
  "w-full border-separate border-spacing-0";

export const nucleusTableHeadCellClass =
  `bg-gray-50 text-gray-700 font-semibold text-xs text-left px-4 h-12 border-b border-gray-200 align-middle ${nucleusTableHeadRounded}`;

export const nucleusTableHeadCellCenterClass =
  `bg-gray-50 text-gray-700 font-semibold text-xs text-center px-4 h-12 border-b border-gray-200 align-middle ${nucleusTableHeadRounded}`;

export const nucleusTableHeadCellCompactClass =
  `bg-gray-50 text-gray-700 font-semibold text-xs text-left px-2 h-10 border-b border-gray-200 align-middle ${nucleusTableHeadRounded}`;

export function nucleusSortableTableHeadCellClass(isActive: boolean) {
  return `${nucleusTableHeadCellClass} cursor-pointer select-none ${
    isActive ? "text-primary" : ""
  }`;
}
