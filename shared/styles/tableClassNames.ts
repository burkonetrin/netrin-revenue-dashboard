/** Estilos de cabeçalho de tabela — espelham `DynamicTable` do Nucleus (HeroUI). */

const nucleusTableHeadRounded =
  "[&:first-child]:rounded-s-lg [&:last-child]:rounded-e-lg";

export const nucleusNativeTableClassName =
  "w-full border-separate border-spacing-0";

/** Corpo das tabelas hierárquicas (cliente → contrato → franquia). */
export const clientHierarchyTableClassName =
  `${nucleusNativeTableClassName} text-[13px] font-normal`;

export const clientHierarchySublineClassName = "text-[11px] text-zinc-500 font-normal";

export const clientHierarchyTableHeadCellClass =
  `bg-gray-50 text-gray-700 font-normal text-xs text-left px-4 h-12 border-b border-gray-200 align-middle ${nucleusTableHeadRounded}`;

export const clientHierarchyTableHeadCellCenterClass =
  `bg-gray-50 text-gray-700 font-normal text-xs text-center px-4 h-12 border-b border-gray-200 align-middle ${nucleusTableHeadRounded}`;

export function clientHierarchySortableTableHeadCellClass(isActive: boolean) {
  return `${clientHierarchyTableHeadCellClass} cursor-pointer select-none ${
    isActive ? "text-primary" : ""
  }`;
}

/** Cabeçalhos da tabela de franquias (sem quebra de linha nos labels). */
export const clientHierarchyFranchiseTableHeadCellClass =
  `${clientHierarchyTableHeadCellClass} whitespace-nowrap`;

/** `DynamicTable` no protótipo comercial (clientes, faturamento, fontes). */
export const prototypeDynamicTableClassNames = {
  th: "bg-gray-50 text-gray-700 font-normal text-xs h-12 border-b border-gray-200",
  td: "text-default-700 border-b border-gray-100 h-14 text-[13px]",
} as const;

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
