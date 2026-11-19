"use client";

import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import type { MockFranchise } from "../../clientesDashboardMockData";
import {
  franchiseMockSources,
  franchiseUserLabel,
  mockFranchiseTypeShortLabel,
  resolveMockFranchiseIsTest,
} from "../../clientesDashboardMockFormat";

interface FranchisePopoverProps {
  franchise: MockFranchise;
  noRenew?: boolean;
}

const franchiseDetailsSectionTitleClass =
  "text-[11px] font-semibold text-foreground m-0";

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className={franchiseDetailsSectionTitleClass}>{title}</p>
      <p className="text-[13px] text-zinc-500 m-0 mt-0.5">{value}</p>
    </div>
  );
}

function FranchiseDetailsBody({
  franchise,
  noRenew,
}: {
  franchise: MockFranchise;
  noRenew: boolean;
}) {
  const sources = franchiseMockSources(franchise);

  return (
    <div className="flex flex-col gap-4 text-left">
      <InfoBlock title="Usuários vinculados" value={franchiseUserLabel(franchise)} />
      <InfoBlock
        title="Tipo"
        value={mockFranchiseTypeShortLabel(resolveMockFranchiseIsTest(franchise.tipo))}
      />
      <InfoBlock title="Status" value={franchise.status} />
      <InfoBlock title="Renovação automática" value={franchise.renAuto} />
      <div>
        <p className={franchiseDetailsSectionTitleClass}>Fontes</p>
        <ul className="m-0 mt-2 list-none flex flex-col gap-2 p-0">
          {sources.map((source) => (
            <li key={source} className="text-[13px] text-zinc-600">
              {source}
            </li>
          ))}
        </ul>
      </div>
      {!noRenew ? (
        <div className="border-t border-zinc-100 pt-3">
          <p className={franchiseDetailsSectionTitleClass}>Ação</p>
          <p className="text-[13px] font-semibold text-[var(--ds-primary)] m-0 mt-1">
            Renovar franquia
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function FranchisePopover({
  franchise,
  noRenew = false,
}: FranchisePopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="inline-flex" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="inline-flex items-center justify-center border-none bg-transparent p-0 text-zinc-600 cursor-pointer outline-none"
        aria-label="Detalhes da franquia"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <MoreHorizontal size={18} />
      </button>
      <DynamicDrawer
        size="lg"
        title="Detalhes"
        subtitle={franchise.name}
        isOpen={open}
        onOpenChange={setOpen}
        classNames={{
          base: "max-w-[504px]",
          header: "font-bold text-gray-950",
          body: "flex-1! mb-0 overflow-y-auto",
        }}
        component={<FranchiseDetailsBody franchise={franchise} noRenew={noRenew} />}
      />
    </span>
  );
}