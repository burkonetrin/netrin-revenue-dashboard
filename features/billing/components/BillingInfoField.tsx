"use client";

interface BillingInfoFieldProps {
  label: string;
  value: string;
}

/**
 * Campo de informação somente leitura no detalhe.
 */
export function BillingInfoField({ label, value }: BillingInfoFieldProps) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
