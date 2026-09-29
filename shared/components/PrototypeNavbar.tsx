"use client";

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";

/** Navbar do protótipo — visual alinhado ao Nucleus (sem auth real). */
export function PrototypeNavbar() {
  return (
    <header className="w-full bg-white flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex-1 max-w-md text-sm text-zinc-500">
        Simulação comercial — dados mock
      </div>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <button
            type="button"
            className="flex items-center gap-3 cursor-pointer rounded-md hover:opacity-80 transition-opacity focus:outline-none"
          >
            <div className="text-right">
              <p className="min-w-20 h-5 text-sm font-medium text-primary-700">
                Usuário
              </p>
              <p className="text-xs text-gray-500">Netrin</p>
            </div>
            <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-500"
                aria-label="Avatar do usuário"
              >
                <title>Avatar</title>
                <path
                  d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z"
                  fill="currentColor"
                />
                <path
                  d="M10 12C5.58172 12 2 14.2386 2 17V20H18V17C18 14.2386 14.4183 12 10 12Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Ações do usuário" variant="flat">
          <DropdownItem key="demo" isReadOnly>
            Protótipo offline
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </header>
  );
}
