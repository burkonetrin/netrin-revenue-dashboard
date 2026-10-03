/** Tipografia padrão de modais (HeroUI Modal / confirmação). */
export const MODAL_TITLE_CLASS = "text-base font-semibold leading-6 text-gray-900";

export const MODAL_BODY_CLASS = "text-sm leading-5 text-gray-700";

export const MODAL_BODY_MUTED_CLASS = "text-sm leading-5 text-gray-600";

/** Botões do rodapé das modais. */
export const MODAL_FOOTER_BUTTON_CLASS = "text-sm font-normal";

/** classNames base para Modal (slots HeroUI). */
export const HEROUI_MODAL_CLASS_NAMES = {
  header: MODAL_TITLE_CLASS,
  body: MODAL_BODY_CLASS,
  footer: "gap-2",
} as const;
