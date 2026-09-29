"use client";

import { MoreHorizontal } from "lucide-react";
import { useMemo } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import type { ClientRowMenuEntry } from "../../clientesDashboardMockData";

function isNonActionKey(key: string) {
  return key.startsWith("__divider-") || key.startsWith("__heading-");
}

function toMenuEntries(menu: ClientRowMenuEntry[]) {
  return menu.map((entry, index) => {
    if (entry.kind === "divider") {
      return {
        key: `__divider-${index}__`,
        label: "",
        kind: "divider" as const,
      };
    }
    if (entry.kind === "heading") {
      return {
        key: `__heading-${entry.label}__`,
        label: entry.label,
        kind: "heading" as const,
      };
    }
    return {
      key: entry.label,
      label: entry.label,
      badge: entry.badge,
      kind: "action" as const,
    };
  });
}

interface RowActionsDropdownProps {
  menu: ClientRowMenuEntry[];
  ariaLabel: string;
  onSelectAction?: (action: string) => void;
}

/** Menu ⋯ de ações da linha — Dropdown HeroUI (Nucleus). */
export function RowActionsDropdown({
  menu,
  ariaLabel,
  onSelectAction,
}: RowActionsDropdownProps) {
  const menuEntries = useMemo(() => toMenuEntries(menu), [menu]);

  return (
    <span className="inline-flex" onClick={(e) => e.stopPropagation()}>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button
            isIconOnly
            size="sm"
            radius="full"
            variant="light"
            aria-label={ariaLabel}
            className="min-w-7 w-7 h-7 bg-zinc-100 text-zinc-600"
          >
            <MoreHorizontal size={18} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label={ariaLabel}
          variant="flat"
          className="w-max min-w-0 max-w-[min(90vw,320px)]"
          items={menuEntries}
          onAction={(key) => {
            const action = String(key);
            if (isNonActionKey(action)) return;
            onSelectAction?.(action);
          }}
        >
          {(item) => {
            if (item.kind === "divider") {
              return (
                <DropdownItem
                  key={item.key}
                  isReadOnly
                  textValue="Divisor"
                  classNames={{
                    base: "p-0 my-1 min-h-0 h-auto cursor-default rounded-none border-t border-default-200 data-[hover=true]:!bg-transparent data-[focus=true]:!bg-transparent pointer-events-none",
                  }}
                >
                  <span className="sr-only">Divisor</span>
                </DropdownItem>
              );
            }
            if (item.kind === "heading") {
              return (
                <DropdownItem
                  key={item.key}
                  textValue={item.label}
                  isReadOnly
                  classNames={{
                    base: "cursor-default opacity-100 rounded-none data-[hover=true]:!bg-transparent data-[focus=true]:!bg-transparent data-[focus-visible=true]:!bg-transparent pointer-events-none",
                    title:
                      "text-[10px] font-semibold uppercase tracking-wide text-default-400",
                  }}
                  className="h-7 min-h-7 py-0.5"
                >
                  {item.label}
                </DropdownItem>
              );
            }
            return (
              <DropdownItem key={item.key} className="text-[13px]">
                <span className="inline-flex items-center gap-2">
                  {item.label}
                  {"badge" in item && item.badge ? (
                    <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                      {item.badge}
                    </span>
                  ) : null}
                </span>
              </DropdownItem>
            );
          }}
        </DropdownMenu>
      </Dropdown>
    </span>
  );
}
