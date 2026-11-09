import type { ReactNode } from "react";

/** Card de exibição de campo informativo nas páginas de detalhes da franquia. */
export function FranchiseInfoCard({
  label,
  value,
}: {
  label: string;
  value: string | ReactNode;
}) {
  return (
    <div className="bg-default-100 rounded-lg p-3 min-h-16">
      <p className="text-xs text-default-500">{label}</p>
      <div className="text-sm text-foreground-800 mt-1">{value}</div>
    </div>
  );
}

/** classNames compartilhados das abas de detalhes da franquia. */
export const franchiseDetailsTabsClassNames = {
  base: "w-full",
  tabList: "gap-6 w-fit relative rounded-lg bg-gray-100 p-1",
  cursor: "bg-primary",
  tab: "max-w-fit px-4 py-2 h-10",
  tabContent: "group-data-[selected=true]:text-white",
} as const;
