"use client";

import { useRef, useState } from "react";
import type { MockFranchise } from "../../clientesDashboardMockData";
import { franchiseUserLabel } from "../../clientesDashboardMockFormat";
import { FloatingPopoverPortal } from "../FloatingPopoverPortal";

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

export function FranchisePopover({
  franchise,
  noRenew = false,
}: FranchisePopoverProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <span className="inline-flex" onClick={(e) => e.stopPropagation()}>
      <button
        ref={anchorRef}
        type="button"
        className="inline-flex min-w-7 w-7 h-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 cursor-pointer border-none text-base leading-none"
        aria-label="Informações da franquia"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        ⋯
      </button>
      <FloatingPopoverPortal
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        align="end"
        className="p-3 text-left"
        minWidth={300}
      >
        <div className="flex flex-col gap-3">
          <InfoBlock
            title="Usuários vinculados"
            value={franchiseUserLabel(franchise)}
          />
          <InfoBlock title="Tipo" value={franchise.tipo} />
          <InfoBlock title="Status" value={franchise.status} />
          <InfoBlock title="Renovação automática" value={franchise.renAuto} />
          {!noRenew ? (
            <div className="pt-1 border-t border-zinc-100">
              <p className="text-[11px] font-semibold text-foreground m-0">
                Ação
              </p>
              <p className="text-[13px] font-semibold text-[var(--ds-primary)] m-0 mt-1">
                Renovar franquia
              </p>
            </div>
          ) : null}
        </div>
      </FloatingPopoverPortal>
    </span>
  );
}
