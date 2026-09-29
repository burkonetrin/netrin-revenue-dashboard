"use client";

import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";

interface LovableShellProps {
  children?: ReactNode;
}

/** Layout do protótipo Lovable: app bar + área de conteúdo (sem sidebar do Nucleus). */
export function LovableShell({ children }: LovableShellProps) {
  return (
    <div className="ds-shell">
      <header className="ds-appbar">
        <div className="ds-appbar__brand">
          <img src="/logoNetrin.png" alt="Netrin" width={80} height={25} />
        </div>
        <span>Usuário</span>
        <span>Netrin</span>
      </header>
      <main className="flex-1 min-h-0">{children ?? <Outlet />}</main>
    </div>
  );
}
