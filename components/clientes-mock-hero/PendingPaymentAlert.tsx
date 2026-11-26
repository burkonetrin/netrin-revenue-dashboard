"use client";

import { AlertTriangle } from "lucide-react";

const PAYMENT_MESSAGE = "Faltam informações de pagamento neste cliente";

export const MISSING_SANKHYA_CODE_MESSAGE =
  "Código Sankhya não identificado. Este cliente somente será integrado após seu código ser definido no Sankhya";

export function PendingPaymentAlert({
  visible,
  message = PAYMENT_MESSAGE,
}: {
  visible: boolean;
  message?: string;
}) {
  if (!visible) return null;
  return (
    <div
      className="flex min-h-14 items-center gap-4 rounded-sm bg-rose-100 px-5 py-4 text-sm text-gray-800"
      role="alert"
    >
      <AlertTriangle size={22} className="shrink-0 text-gray-900" />
      <span>{message}</span>
    </div>
  );
}
