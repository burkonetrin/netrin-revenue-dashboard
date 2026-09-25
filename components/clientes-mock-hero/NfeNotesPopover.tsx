"use client";

import { Button } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import type { MockNfeNote } from "../../clientesDashboardMockData";
import { nfeCountLabel } from "../../clientesDashboardMockFormat";

interface NfeNotesPopoverProps {
  notes: MockNfeNote[];
}

export function NfeNotesPopover({ notes }: NfeNotesPopoverProps) {
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
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        className="border-none bg-transparent p-0 text-primary font-medium underline cursor-pointer font-inherit text-[13px]"
        onClick={() => setOpen((v) => !v)}
      >
        {nfeCountLabel(notes.length)}
      </button>
      {open ? (
        <div
          className="absolute left-0 top-full z-[10080] mt-2 min-w-[260px] max-w-xs rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] shadow-lg"
          role="dialog"
        >
          {notes.map((note, i) => (
            <div key={i}>
              {i > 0 ? <hr className="border-zinc-200 my-2" /> : null}
              <div className="py-1">
                <div>
                  {note.tipo}: {note.nome}
                </div>
                <div className="text-zinc-600">Vencimento: {note.vencimento}</div>
                <div className="text-zinc-500 text-[12px] mt-0.5">
                  {note.statusPagamento}
                </div>
                <Button
                  size="sm"
                  variant="bordered"
                  className="mt-2 text-primary font-semibold"
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
