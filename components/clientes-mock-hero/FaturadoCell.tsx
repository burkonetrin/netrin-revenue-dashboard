"use client";

import type { InvoiceStatusKey } from "../../clientesDashboardMockData";
import { fmt, fmtDetail } from "../../clientesDashboardMockFormat";
import { InvoiceStatusChip } from "./MockChips";

type FaturadoLayout = "badge-below" | "badge-right";

export function FaturadoWithBadge({
  amount,
  statusKey,
  valorPagoParcial,
  detailed = false,
  layout = "badge-below",
}: {
  amount: number;
  statusKey: InvoiceStatusKey;
  valorPagoParcial?: number;
  detailed?: boolean;
  layout?: FaturadoLayout;
}) {
  const val = detailed ? fmtDetail(amount) : fmt(amount);

  if (layout === "badge-right") {
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <span className="font-semibold">{val}</span>
        <InvoiceStatusChip
          statusKey={statusKey}
          valorPagoParcial={valorPagoParcial}
        />
      </span>
    );
  }

  return (
    <div>
      <span className="font-semibold block">{val}</span>
      <div className="mt-1">
        <InvoiceStatusChip
          statusKey={statusKey}
          valorPagoParcial={valorPagoParcial}
        />
      </div>
    </div>
  );
}
