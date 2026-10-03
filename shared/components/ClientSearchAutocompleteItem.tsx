"use client";

import { AutocompleteItem } from "@heroui/react";
import type { Client } from "@/features/clients/types/clients.types";

/** Valor textual usado na filtragem/seleção do autocomplete de cliente. */
export function getClientTextValue(client: Client): string {
  return [client.name, client.fantasyName, client.cnpj].filter(Boolean).join(" ");
}

/**
 * Item de autocomplete de cliente (nome + fantasia/CNPJ).
 */
export function renderClientSearchAutocompleteItem(client: Client) {
  return (
    <AutocompleteItem key={client.id} textValue={getClientTextValue(client)}>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-foreground">{client.name}</span>
        <span className="text-xs text-default-400">
          {[client.fantasyName, client.cnpj].filter(Boolean).join(" · ")}
        </span>
      </div>
    </AutocompleteItem>
  );
}
