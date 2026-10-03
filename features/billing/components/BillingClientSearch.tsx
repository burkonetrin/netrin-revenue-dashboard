"use client";

import { useClientById } from "@/features/clients/hooks/useClientById";
import { useClientSearch } from "@/features/clients/hooks/useClientSearch";
import { renderClientSearchAutocompleteItem } from "@/shared/components/ClientSearchAutocompleteItem";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { Autocomplete } from "@heroui/react";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface BillingClientSearchProps {
  clientId?: string;
  canReadClient: boolean;
  onClientChange: (clientId: string | undefined) => void;
  className?: string;
}

/**
 * Busca por cliente na toolbar da listagem de faturamento.
 * Selecionar/limpar atualiza o filtro via URL (`?client=`), sem navegar para o cadastro.
 */
export function BillingClientSearch({
  clientId,
  canReadClient,
  onClientChange,
  className,
}: BillingClientSearchProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { data: selectedClient } = useClientById(canReadClient ? clientId : undefined);

  const hydratedName = selectedClient?.name?.trim() ?? "";
  const isTypingSearch = Boolean(clientId) && inputValue.trim() !== hydratedName;
  const searchQuery =
    inputValue.trim().length >= 2 && (!clientId || isTypingSearch) ? inputValue : "";

  const { data, isFetching, isLoading } = useClientSearch(searchQuery);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!clientId) {
      setInputValue("");
      return;
    }

    if (hydratedName) {
      setInputValue(hydratedName);
    }
  }, [clientId, hydratedName]);

  const clients = searchQuery ? (data?.data ?? []) : [];
  const showLoading = Boolean(searchQuery) && (isLoading || isFetching);

  const fieldClassName = className ?? "w-full max-w-md";

  if (!isMounted) {
    return (
      <div
        aria-hidden
        className={`h-10 rounded-lg border border-default-200 bg-zinc-100 ${fieldClassName}`}
      />
    );
  }

  return (
    <Autocomplete
      aria-label="Buscar cliente"
      placeholder="Pesquise por cliente, nome fantasia ou CNPJ"
      className={fieldClassName}
      inputValue={inputValue}
      onInputChange={setInputValue}
      selectedKey={clientId ?? null}
      onSelectionChange={(key) => {
        if (!key) {
          onClientChange(undefined);
          setInputValue("");
          return;
        }

        const id = String(key);
        const selected = clients.find((client) => client.id === id);
        onClientChange(id);
        setInputValue(selected?.name ?? "");
      }}
      onClear={() => {
        onClientChange(undefined);
        setInputValue("");
      }}
      isLoading={showLoading}
      items={clients}
      allowsCustomValue={false}
      defaultFilter={() => true}
      menuTrigger="input"
      listboxProps={{
        emptyContent:
          inputValue.trim().length >= 2 && !showLoading ? "Nenhum cliente encontrado" : " ",
      }}
      inputProps={{
        classNames: defaultInputClassNames,
        startContent: <Search className="text-gray-400" size={20} />,
      }}
    >
      {(client) => renderClientSearchAutocompleteItem(client)}
    </Autocomplete>
  );
}
