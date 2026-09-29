"use client";

import { useRef, useState } from "react";
import type { MockNfeNote } from "../../clientesDashboardMockData";
import { nfeCountLabel } from "../../clientesDashboardMockFormat";
import { FloatingPopoverPortal } from "../FloatingPopoverPortal";
import { NfeNotesListContent } from "./NfeNotesListContent";

interface NfeNotesPopoverProps {
  notes: MockNfeNote[];
}

export function NfeNotesPopover({ notes }: NfeNotesPopoverProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        className="border-none bg-transparent p-0 text-primary font-medium underline cursor-pointer font-inherit text-[13px]"
        onClick={() => setOpen((v) => !v)}
      >
        {nfeCountLabel(notes.length)}
      </button>
      <FloatingPopoverPortal
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        className="px-3 py-2 text-[13px] w-max max-w-[min(90vw,320px)]"
        fitContent
      >
        <NfeNotesListContent notes={notes} />
      </FloatingPopoverPortal>
    </>
  );
}
