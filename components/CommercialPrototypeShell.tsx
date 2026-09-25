"use client";

/**
 * Shell da simulação: mesmo padrão visual do Nucleus (sidebar + área principal),
 * sem RouteGuard, navbar de usuário nem API.
 */

import { Outlet } from "react-router-dom";
import { commercialDashboardPrototypeMenuItems } from "../prototypeMenuItems";
import { Sidebar } from "@/shared/components/sidebar/Sidebar";

export function CommercialPrototypeShell() {
  return (
    <div className="min-h-screen flex flex-row">
      <Sidebar items={commercialDashboardPrototypeMenuItems} />
      <div className="flex flex-col flex-1 h-screen overflow-y-auto">
        <header
          className="w-full bg-white flex flex-wrap items-center justify-between gap-2 p-4 border-b border-gray-200"
        >
          <span className="text-sm font-semibold text-zinc-800">
            Simulação — Painel comercial
          </span>
          <span className="text-xs text-zinc-500">
            Dados fictícios · acesso público · não conectado ao Nucleus
          </span>
        </header>
        <main className="flex-1 bg-zinc-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
