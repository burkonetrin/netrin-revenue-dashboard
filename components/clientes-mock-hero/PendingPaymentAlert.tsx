"use client";

import { AlertTriangle } from "lucide-react";

export function PendingPaymentAlert({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="flex min-h-14 items-center gap-4 rounded-sm bg-rose-100 px-5 py-4 text-sm text-gray-800"
      role="alert"
    >
      <AlertTriangle size={22} className="shrink-0 text-gray-900" />
      <span>Faltam informações de pagamento neste cliente</span>
    </div>
  );
}
