"use client";

export interface SupportToolsBillableSummary {
  total: number;
  billable: number;
  notBillable: number;
}

function formatCount(value: number): string {
  return value.toLocaleString("pt-BR");
}

const CARDS: { key: keyof SupportToolsBillableSummary; label: string }[] = [
  { key: "total", label: "Total de consultas" },
  { key: "billable", label: "Billable" },
  { key: "notBillable", label: "Not billable" },
];

export function SupportToolsSummaryCards({ summary }: { summary: SupportToolsBillableSummary }) {
  return (
    <section
      aria-label="Resumo de consultas"
      className="grid w-full max-w-[50%] grid-cols-3 gap-3"
    >
      {CARDS.map((card) => (
        <article
          key={card.label}
          aria-label={card.label}
          className="flex min-h-[72px] min-w-0 items-center rounded-xl px-4 py-3"
          style={{ backgroundColor: "#f0f9ff" }}
        >
          <div>
            <div className="text-xs text-default-600">{card.label}</div>
            <div className="mt-1 text-xl font-medium text-default-800">
              <strong className="font-medium">{formatCount(summary[card.key])}</strong>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export function computeConsultationBillableSummary(
  rows: { origin: string }[],
): SupportToolsBillableSummary {
  let billable = 0;
  let notBillable = 0;
  for (const row of rows) {
    if (row.origin === "Billable") billable += 1;
    else notBillable += 1;
  }
  return { total: rows.length, billable, notBillable };
}

export function computeBankTransactionBillableSummary(
  rows: { isBillable: boolean }[],
): SupportToolsBillableSummary {
  let billable = 0;
  let notBillable = 0;
  for (const row of rows) {
    if (row.isBillable) billable += 1;
    else notBillable += 1;
  }
  return { total: rows.length, billable, notBillable };
}
