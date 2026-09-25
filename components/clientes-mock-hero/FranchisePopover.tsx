"use client";

import { useEffect, useRef, useState } from "react";
import type { MockFranchise } from "../../clientesDashboardMockData";

interface FranchisePopoverProps {
  franchise: MockFranchise;
  noRenew?: boolean;
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-foreground m-0">{title}</p>
      <p className="text-[13px] text-zinc-500 m-0 mt-0.5">{value}</p>
    </div>
  );
}

/** Painel informativo no ⋯ da franquia — sem Popover Hero (evita chunk dom-animation). */
export function FranchisePopover({
  franchise,
  noRenew = false,
}: FranchisePopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative inline-flex"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="inline-flex min-w-7 w-7 h-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 cursor-pointer border-none text-base leading-none"
        aria-label="Informações da franquia"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        ⋯
      </button>
      {open ? (
        <div
          className="absolute right-0 top-full z-[10060] mt-1 min-w-[280px] rounded-lg border border-zinc-200 bg-white p-3 text-left shadow-lg"
          role="dialog"
        >
          <div className="flex flex-col gap-3">
            <InfoBlock title="Usuários vinculados" value={franchise.user} />
            <InfoBlock title="Tipo" value={franchise.tipo} />
            <InfoBlock title="Status" value={franchise.status} />
            <InfoBlock
              title="Renovação automática"
              value={franchise.renAuto}
            />
            {!noRenew ? (
              <div className="pt-1 border-t border-zinc-100">
                <p className="text-[11px] font-semibold text-foreground m-0">
                  Ação
                </p>
                <p className="text-[13px] font-semibold text-primary m-0 mt-1">
                  Renovar franquia
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
