"use client";

import type { ReactNode } from "react";
import type {
  InvoiceStatusKey,
  MockParcelaAtrasada,
} from "../../clientesDashboardMockData";
import { fmt, fmtDetail, excedenteDestinoLabel } from "../../clientesDashboardMockFormat";
import { InvoiceStatusChip } from "./MockChips";
import { MockInfoTooltip } from "./MockInfoTooltip";

type FaturadoLayout = "badge-below" | "badge-right";

function ParcelasAtrasadasTooltip({
  parcelas,
}: {
  parcelas: MockParcelaAtrasada[];
}) {
  return (
    <div className="space-y-2">
      {parcelas.map((p) => (
        <p key={p.numero} className="m-0">
          Parcela {p.numero}: {fmtDetail(p.valor)} em {p.competencia}
        </p>
      ))}
    </div>
  );
}

function StatusWithExtras({
  statusKey,
  faturadoAmount,
  valorPagoParcial,
  valorPagoExcedente,
  excedenteDestino,
  parcelasAtrasadas,
  trailingAfterStatus,
}: {
  statusKey: InvoiceStatusKey;
  faturadoAmount: number;
  valorPagoParcial?: number;
  valorPagoExcedente?: number;
  excedenteDestino?: "reembolsado" | "abatido";
  parcelasAtrasadas?: MockParcelaAtrasada[];
  trailingAfterStatus?: ReactNode;
}) {
  const showParcelas =
    statusKey === "divida_parcelada" &&
    parcelasAtrasadas &&
    parcelasAtrasadas.length > 0;

  const showPagoParcial =
    statusKey === "pago_parcial" && valorPagoParcial != null;

  const showPagoExcedente =
    statusKey === "pago_duplicidade" && valorPagoExcedente != null;

  return (
    <span className="inline-flex flex-nowrap items-center gap-1.5">
      <InvoiceStatusChip statusKey={statusKey} />
      {trailingAfterStatus}
      {showPagoParcial ? (
        <MockInfoTooltip
          content={
            <div className="space-y-1">
              <p className="m-0">
                Valor pago: {fmtDetail(valorPagoParcial)}
              </p>
              <p className="m-0">
                A pagar:{" "}
                {fmtDetail(Math.max(0, faturadoAmount - valorPagoParcial))}
              </p>
            </div>
          }
        />
      ) : null}
      {showPagoExcedente ? (
        <MockInfoTooltip
          content={
            <div className="space-y-1">
              <p className="m-0">
                Valor pago em excedente: {fmtDetail(valorPagoExcedente)}
              </p>
              {excedenteDestino ? (
                <p className="m-0">
                  {excedenteDestinoLabel(excedenteDestino)}
                </p>
              ) : null}
            </div>
          }
        />
      ) : null}
      {showParcelas ? (
        <MockInfoTooltip
          content={
            <ParcelasAtrasadasTooltip parcelas={parcelasAtrasadas} />
          }
        />
      ) : null}
    </span>
  );
}

export function FaturadoWithBadge({
  amount,
  statusKey,
  valorPagoParcial,
  valorPagoExcedente,
  excedenteDestino,
  parcelasAtrasadas,
  detailed = false,
  layout = "badge-below",
  trailingAfterStatus,
}: {
  amount: number;
  statusKey: InvoiceStatusKey;
  valorPagoParcial?: number;
  valorPagoExcedente?: number;
  excedenteDestino?: "reembolsado" | "abatido";
  parcelasAtrasadas?: MockParcelaAtrasada[];
  detailed?: boolean;
  layout?: FaturadoLayout;
  /** Conteúdo imediatamente à direita do chip de status (ex.: +N). */
  trailingAfterStatus?: ReactNode;
}) {
  const val = detailed ? fmtDetail(amount) : fmt(amount);

  if (layout === "badge-right") {
    return (
      <span className="inline-flex flex-nowrap items-center gap-1.5">
        <span>{val}</span>
        <StatusWithExtras
          statusKey={statusKey}
          faturadoAmount={amount}
          valorPagoParcial={valorPagoParcial}
          valorPagoExcedente={valorPagoExcedente}
          excedenteDestino={excedenteDestino}
          parcelasAtrasadas={parcelasAtrasadas}
          trailingAfterStatus={trailingAfterStatus}
        />
      </span>
    );
  }

  return (
    <div>
      <span className="block">{val}</span>
      <div className="mt-1">
        <StatusWithExtras
          statusKey={statusKey}
          faturadoAmount={amount}
          valorPagoParcial={valorPagoParcial}
          valorPagoExcedente={valorPagoExcedente}
          excedenteDestino={excedenteDestino}
          parcelasAtrasadas={parcelasAtrasadas}
          trailingAfterStatus={trailingAfterStatus}
        />
      </div>
    </div>
  );
}
