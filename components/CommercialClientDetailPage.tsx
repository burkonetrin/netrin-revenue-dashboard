"use client";

import { useParams } from "react-router-dom";
import { ClientDetailView } from "./clientes-mock-hero/ClientDetailView";

export function CommercialClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();

  if (!clientId) {
    return null;
  }

  return (
    <div className="bg-white -m-6 md:-m-8 min-h-full">
      <ClientDetailView clientId={clientId} />
    </div>
  );
}
