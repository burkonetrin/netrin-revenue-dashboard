"use client";

import { defaultSelectClassNames } from "@/shared/styles/inputClassNames";
import {
  Dropdown,
  DropdownMenu,
  DropdownTrigger,
  type DropdownMenuProps,
} from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

const triggerButtonClassName =
  "inline-flex h-10 min-h-10 w-full max-w-full items-center justify-between gap-2 rounded-small border border-gray-300 bg-white px-3 text-left text-sm font-normal text-gray-900 outline-none transition-none active:scale-100 focus-visible:outline-none";

type NucleusDropdownTextButtonProps<T extends object = object> = Omit<
  DropdownMenuProps<T>,
  | "variant"
  | "classNames"
  | "style"
  | "aria-label"
  | "selectionMode"
  | "selectedKeys"
  | "defaultSelectedKeys"
  | "onSelectionChange"
  | "disallowEmptySelection"
> & {
  label: string;
  ariaLabel?: string;
  placement?: "bottom" | "bottom-start" | "bottom-end";
};

/**
 * Botão com texto + chevron e menu (sem estado de seleção no menu).
 * A largura do menu acompanha a do botão (conteúdo do label).
 */
export function NucleusDropdownTextButton<T extends object = object>({
  label,
  ariaLabel,
  placement = "bottom-start",
  children,
  ...menuProps
}: NucleusDropdownTextButtonProps<T>) {
  const triggerWrapRef = useRef<HTMLDivElement>(null);
  const [menuWidth, setMenuWidth] = useState<number>();

  useLayoutEffect(() => {
    const el = triggerWrapRef.current;
    if (!el) return;
    setMenuWidth(el.getBoundingClientRect().width);
  }, [label]);

  const resolvedAriaLabel = ariaLabel ?? label;

  return (
    <div
      ref={triggerWrapRef}
      className="inline-flex w-fit max-w-full"
      style={menuWidth ? { width: menuWidth } : undefined}
    >
      <Dropdown
        placement={placement}
        classNames={{
          content: `${defaultSelectClassNames.popoverContent} p-0 min-w-0`,
        }}
      >
        <DropdownTrigger className="w-full">
          <button type="button" aria-label={resolvedAriaLabel} className={triggerButtonClassName}>
            <span className="whitespace-nowrap">{label}</span>
            <ChevronDown size={16} className="shrink-0 text-default-500" aria-hidden />
          </button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label={resolvedAriaLabel}
          variant="flat"
          selectionMode="none"
          classNames={{
            base: "min-w-0 p-0",
            list: `${defaultSelectClassNames.listbox} max-h-[400px] overflow-y-auto`,
          }}
          style={menuWidth ? { width: menuWidth } : undefined}
          {...menuProps}
        >
          {children}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
