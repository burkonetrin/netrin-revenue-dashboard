"use client";

import { Button } from "@heroui/react";
import type { MockNfeNote } from "../../clientesDashboardMockData";
import { NfeNoteStacked } from "./NfeNoteStacked";

interface NfeNotesListContentProps {
  notes: MockNfeNote[];
}

export function NfeNotesListContent({ notes }: NfeNotesListContentProps) {
  return (
    <>
      {notes.map((note, i) => (
        <div key={i}>
          {i > 0 ? <hr className="border-default-200 my-2" /> : null}
          <div className="py-1">
            <NfeNoteStacked note={note} />
            <Button
              size="sm"
              radius="sm"
              variant="bordered"
              className="mt-2 font-semibold"
            >
              Baixar nota
            </Button>
          </div>
        </div>
      ))}
    </>
  );
}
