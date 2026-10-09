/**
 * Páginas internas do Nucleus usam `p-6` no próprio conteúdo (layout privado sem padding no `<main>`).
 * O protótipo aplica padding no `NucleusShell`; estas classes anulam o main e reaplicam `p-6`.
 */
export const nucleusPrivatePageShellCancelMainPaddingClass =
  "relative min-h-full -m-6 md:-m-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] max-w-none";

/** Conteúdo com `p-6` próprio (listagens sem wrapper interno). */
export const nucleusPrivatePageShellClass =
  `${nucleusPrivatePageShellCancelMainPaddingClass} p-6`;

export const nucleusPrivatePageShellSpaceY6Class =
  `${nucleusPrivatePageShellClass} size-full space-y-6`;

/** Abas da página Fontes e Fornecedores — igual `app/(private)/providers/page.tsx` no Nucleus. */
export const providersPageTabsClassNames = {
  base: "w-full",
  tabList: "gap-6 w-fit relative rounded-lg bg-gray-100 p-1",
  cursor: "bg-primary",
  tab: "max-w-fit px-4 py-2 h-10",
  tabContent: "group-data-[selected=true]:text-white",
} as const;
