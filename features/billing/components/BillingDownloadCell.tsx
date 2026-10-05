"use client";

import type { ReactNode } from "react";
import { Tooltip } from "@heroui/react";
import { HEROUI_TOOLTIP_PANEL_CLASS_NAMES, TOOLTIP_TITLE_CLASS } from "@/shared/constants/tooltip.constants";
import type { BillingInvoiceRecord } from "../types/billing.types";
import {
  getBillingListingDueDateView,
  getBillingListingTooltipNotes,
  getBillingNoteDownloadTooltipTitle,
} from "../utils/billing.utils";
import { resolveNoteBillingStatus } from "../utils/billing-invoice-status.utils";
import {
  BillingDueDateDownloadLinks,
  shouldShowBillingDownloadLinks,
} from "./BillingDueDateDownloadLinks";

interface BillingDownloadCellProps {
  record: BillingInvoiceRecord;
}

function DownloadCellAlign({ children }: { children: ReactNode }) {
  return <div className="flex min-h-12 items-center">{children}</div>;
}

export function BillingDownloadCell({ record }: BillingDownloadCellProps) {
  const { notes, scope } = record.invoiceDetails;
  const view = getBillingListingDueDateView(notes);
  const recordStatus = record.billingStatus ?? "fatura_aberta";

  if (view.kind !== "multi") {
    if (!shouldShowBillingDownloadLinks(recordStatus)) {
      return (
        <DownloadCellAlign>
          <span className="text-gray-400">—</span>
        </DownloadCellAlign>
      );
    }
    return (
      <DownloadCellAlign>
        <BillingDueDateDownloadLinks />
      </DownloadCellAlign>
    );
  }

  const orderedNotes = getBillingListingTooltipNotes(scope, view.notes);

  return (
    <DownloadCellAlign>
      <Tooltip
      placement="right"
      showArrow
      radius="sm"
      content={
        <div className="flex max-h-[344px] flex-col gap-4 overflow-y-auto rounded-xl px-3 py-1">
          {orderedNotes.map((note) => {
            const noteStatus = resolveNoteBillingStatus(note, recordStatus);

            return (
              <div key={note.id} className="space-y-3">
                {(note.destinations?.length ? note.destinations : [undefined]).map(
                  (destination, destinationIndex) => {
                    const destinationNote = destination
                      ? { ...note, destinations: [destination] }
                      : note;

                    return (
                      <div
                        key={`${note.id}-${destination?.kind ?? "note"}-${destinationIndex}`}
                        className="space-y-2"
                      >
                        <p className={TOOLTIP_TITLE_CLASS}>
                          {getBillingNoteDownloadTooltipTitle(destinationNote, scope)}
                        </p>
                        {shouldShowBillingDownloadLinks(noteStatus) ? (
                          <BillingDueDateDownloadLinks />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            );
          })}
        </div>
      }
      classNames={HEROUI_TOOLTIP_PANEL_CLASS_NAMES}
    >
      <button type="button" className="text-gray-900 hover:text-primary" onClick={(e) => e.stopPropagation()}>
        {orderedNotes.length} notas
      </button>
    </Tooltip>
    </DownloadCellAlign>
  );
}
