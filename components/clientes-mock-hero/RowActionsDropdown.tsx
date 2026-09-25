"use client";

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";

interface RowActionsDropdownProps {
  items: string[];
  ariaLabel: string;
}

export function RowActionsDropdown({ items, ariaLabel }: RowActionsDropdownProps) {
  return (
    <div className="inline-flex" onClick={(e) => e.stopPropagation()}>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <button
            type="button"
            className="inline-flex min-w-7 w-7 h-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 cursor-pointer border-none text-base leading-none"
            aria-label={ariaLabel}
          >
            ⋯
          </button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label={ariaLabel}
          classNames={{ base: "z-[10060]" }}
        >
          {items.map((action, index) => (
            <DropdownItem key={`${index}-${action}`} textValue={action}>
              {action}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
