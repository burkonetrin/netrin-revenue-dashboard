"use client";

import { useMemo } from "react";
import { Spinner } from "@heroui/react";
import { ExpandableClientList } from "@/shared/components/ExpandableClientList";
import { useBundleLinkedClients } from "../hooks/useBundleLinkedClients";
import type { DataSourceBundle } from "../types/data-source-bundles.types";

interface BundleLinkedClientsSidebarProps {
  bundle: DataSourceBundle | null;
}

/**
 * Painel lateral com clientes e franquias vinculados a um grupo de fontes.
 */
export function BundleLinkedClientsSidebar({
  bundle,
}: BundleLinkedClientsSidebarProps) {
  const { data, isLoading, isError } = useBundleLinkedClients(bundle?.id ?? null);

  const clients = useMemo(() => {
    const raw = data?.data ?? [];
    return raw.map((client) => ({
      ...client,
      deductibles: [...client.deductibles].sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR"),
      ),
    }));
  }, [data?.data]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        Não foi possível carregar os clientes vinculados a este grupo.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-default-500">Clientes com este grupo de fontes</p>

      <ExpandableClientList
        clients={clients}
        emptyMessage="Nenhum cliente vinculado a este grupo de fontes"
        titleClassName="text-sm font-medium text-default-800"
        collapsedChevron="left"
        chevronSize={18}
        panelClassName="px-5 pb-4 space-y-2 border-t border-default-200"
        renderPanel={(client) => (
          <>
            <p className="text-xs text-default-500 pt-3">
              Franquias que usam este grupo
            </p>
            {client.deductibles.length === 0 ? (
              <p className="text-sm text-default-400">Nenhuma franquia vinculada</p>
            ) : (
              <div className="rounded-lg bg-default-100 px-4 py-3 space-y-1">
                {client.deductibles.map((franchise) => (
                  <p key={franchise.id} className="text-sm text-default-700">
                    {franchise.name}
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      />
    </div>
  );
}
