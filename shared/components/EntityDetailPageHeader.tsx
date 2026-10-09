"use client";

import type { ReactNode } from "react";
import { Breadcrumbs, Tabs } from "@heroui/react";

/** classNames compartilhados das abas de páginas de detalhes de entidade. */
export const entityDetailTabsClassNames = {
  base: "w-full",
  tabList: "gap-6 w-fit relative rounded-lg bg-gray-100 p-1",
  cursor: "bg-primary",
  tab: "max-w-fit px-4 py-2 h-10",
  tabContent: "group-data-[selected=true]:text-white",
} as const;

interface EntityDetailPageHeaderProps {
  breadcrumbs?: ReactNode;
  header?: ReactNode;
  tabsAriaLabel: string;
  defaultSelectedKey?: string;
  children: ReactNode;
}

/**
 * Layout compartilhado de páginas de detalhes (breadcrumbs, cabeçalho e abas).
 */
export function EntityDetailPageHeader({
  breadcrumbs,
  header,
  tabsAriaLabel,
  defaultSelectedKey = "sobre",
  children,
}: EntityDetailPageHeaderProps) {
  return (
    <div className="size-full p-6">
      {breadcrumbs ? <Breadcrumbs className="mb-4">{breadcrumbs}</Breadcrumbs> : null}
      {header ? <div>{header}</div> : null}
      <div className={header ? "mt-6" : undefined}>
        <Tabs
          aria-label={tabsAriaLabel}
          defaultSelectedKey={defaultSelectedKey}
          classNames={entityDetailTabsClassNames}
        >
          {children}
        </Tabs>
      </div>
    </div>
  );
}
