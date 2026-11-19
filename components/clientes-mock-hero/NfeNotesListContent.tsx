"use client";

import { Fragment } from "react";
import { BillingDueDateDownloadLinks } from "@/features/billing/components/BillingDueDateDownloadLinks";
import type { MockNfeNote } from "../../clientesDashboardMockData";
import { NfeNoteStacked } from "./NfeNoteStacked";

interface NfeNotesListContentProps {
  notes: MockNfeNote[];
}

export function NfeNotesListContent({ notes }: NfeNotesListContentProps) {
  return (
    <div className="flex flex-col">
      {notes.map((note, index) => (
        <Fragment key={`${note.tipo}-${note.nome}-${index}`}>
          {index > 0 ? (
            <div
              className="my-4 border-t border-zinc-200"
              role="separator"
              aria-hidden
            />
          ) : null}
          <NfeNoteStacked note={note} />
          <BillingDueDateDownloadLinks className="mt-3.5" />
        </Fragment>
      ))}
    </div>
  );
}