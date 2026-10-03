/** Tipografia padrão de tooltips (HeroUI, portal, hover). */
export const TOOLTIP_BODY_CLASS = "text-xs leading-5 text-gray-900";

export const TOOLTIP_MUTED_CLASS = "text-xs leading-5 text-gray-600";

export const TOOLTIP_TITLE_CLASS = "text-xs font-semibold leading-5 text-gray-900";

/** @heroui/react Tooltip — conteúdo compacto. */
export const HEROUI_TOOLTIP_CONTENT_CLASS_NAMES = {
  content: `bg-white shadow-lg rounded-sm border border-gray-100 px-2 py-1 ${TOOLTIP_BODY_CLASS}`,
} as const;

/** @heroui/react Tooltip — painéis scrolláveis (ex.: multi-nota). */
export const HEROUI_TOOLTIP_PANEL_CLASS_NAMES = {
  content: `bg-white shadow-lg rounded-xl border border-gray-100 p-0 ${TOOLTIP_BODY_CLASS}`,
} as const;
