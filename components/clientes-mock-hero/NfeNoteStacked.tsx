"use client";

import { Chip } from "@heroui/react";
import type { MockNfeNote } from "../../clientesDashboardMockData";
import {
  nfeNoteDescription,
  nfeNoteTitleLabel,
} from "../../clientesDashboardMockFormat";

function statusChipClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("pago total") || s.includes("pago totalmente")) {
    return "bg-green-100 text-green-800";
  }
  if (s.includes("pago parcial") || s.includes("pago excedente")) {
    return "bg-orange-100 text-orange-800";
  }
  if (s.includes("cancel") || s.includes("baixa cont")) {
    return "bg-red-100 text-red-900";
  }
  if (s.includes("vencid") || s.includes("aberto")) {
    return "bg-amber-100 text-amber-900";
  }
  if (s.includes("parcelad")) {
    return "bg-sky-100 text-sky-900";
  }
  return "bg-zinc-100 text-zinc-600";
}

interface NfeNoteStackedProps {
  note: MockNfeNote;
  className?: string;
}

export function NfeNoteStacked({ note, className = "" }: NfeNoteStackedProps) {
  const referencia = note.referencia?.trim();

  return (
    <span className={`flex flex-col gap-1.5 w-full min-w-0 ${className}`.trim()}>
      <span className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-zinc-900">
          {nfeNoteTitleLabel(note)}
        </span>
        <Chip
          size="sm"
          variant="flat"
          classNames={{
            base: `${statusChipClass(note.statusPagamento)} h-auto max-w-full shrink-0`,
            content: "text-[10px] font-normal px-2 py-0.5 leading-snug",
          }}
        >
          {note.statusPagamento}
        </Chip>
      </span>
      <span className="flex flex-wrap items-center gap-x-5 text-[12px] text-zinc-500">
        {referencia ? (
          <span>
            <span className="font-semibold text-zinc-700">Ref.</span> {referencia}
          </span>
        ) : null}
        <span>
          <span className="font-semibold text-zinc-700">Vencimento:</span>{" "}
          {note.vencimento}
        </span>
      </span>
      <p className="text-[12px] leading-snug text-zinc-600 line-clamp-2">
        {nfeNoteDescription(note)}
      </p>
    </span>
  );
}
