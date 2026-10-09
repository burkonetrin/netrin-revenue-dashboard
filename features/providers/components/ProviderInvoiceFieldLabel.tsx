import type { ReactNode } from "react";

interface ProviderInvoiceFieldLabelProps {
  children: ReactNode;
  isRequired?: boolean;
}

/** Keeps every financial drawer field label outside its HeroUI control. */
export function ProviderInvoiceFieldLabel({
  children,
  isRequired = false,
}: ProviderInvoiceFieldLabelProps) {
  return (
    <span className="text-sm text-[#52525B]">
      {children}
      {isRequired ? <span className="text-danger">*</span> : null}
    </span>
  );
}
