"use client";

import { BillingDueDateDownloadLinks } from "@/features/billing/components/BillingDueDateDownloadLinks";
import type { MockNfeNote } from "../../clientesDashboardMockData";
import { NfeNoteStacked } from "./NfeNoteStacked";

interface NfeNotesListContentProps {
  notes: MockNfeNote[];
}

export function NfeNotesListContent({ notes }: NfeNotesListContentProps) {
  return (
    <div className="flex flex-col gap-3">
      {notes.map((note, i) => (
        <div
          key={i}
          className="rounded-lg bg-zinc-50 px-4 py-3"
        >
          <NfeNoteStacked note={note} />
          <BillingDueDateDownloadLinks className="mt-2.5" />
        </div>
      ))}
    </div>
  );
}
