import type { ReactNode } from "react";

export interface DirectProviderInvoiceTotalItem {
  label: string;
  value: ReactNode;
  testId: string;
}

export interface DirectProviderInvoiceTotalsProps {
  items: readonly DirectProviderInvoiceTotalItem[];
}

/** Presents the shared final total block for direct provider invoice drawers. */
export function DirectProviderInvoiceTotals({ items }: DirectProviderInvoiceTotalsProps) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4" aria-labelledby="direct-provider-total-title">
        <h3 id="direct-provider-total-title" className="text-base font-medium text-[#52525B]">
          Total
        </h3>
        <div
          className={`grid grid-cols-1 gap-4 ${items.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}
        >
          {items.map((item) => (
            <div key={item.label} className="rounded-lg bg-[#FAFAFA] p-4" data-testid={item.testId}>
              <span className="text-sm leading-6 text-default-500">{item.label}</span>
              <p className="mt-2 text-xl font-medium leading-4 text-default-700">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
