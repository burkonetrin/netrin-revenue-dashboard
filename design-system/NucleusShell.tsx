"use client";

import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { commercialDashboardPrototypeMenuItems } from "@/prototypeMenuItems";
import { PrototypeNavbar } from "@/shared/components/PrototypeNavbar";
import { Sidebar } from "@/shared/components/sidebar/Sidebar";

interface NucleusShellProps {
  children?: ReactNode;
}

/** Shell do protótipo: sidebar + navbar + conteúdo (layout Nucleus). */
export function NucleusShell({ children }: NucleusShellProps) {
  return (
    <div className="min-h-screen flex flex-row bg-zinc-50 text-zinc-900">
      <Sidebar items={commercialDashboardPrototypeMenuItems} />
      <div className="flex flex-col flex-1 h-screen overflow-y-auto">
        <PrototypeNavbar />
        <main className="flex-1 p-6 md:p-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
