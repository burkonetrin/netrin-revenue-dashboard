"use client";

import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { ExpandableClientList } from "@/shared/components/ExpandableClientList";
import { Spinner } from "@heroui/react";
import { useMemo } from "react";
import { useDataSourceTemplates } from "../hooks/useDataSourceTemplates";
import type { DataSource } from "../types/data-sources.types";

interface DataSourceLinkedTemplatesSidebarProps {
  source: DataSource | null;
  onClose: () => void;
}

export function DataSourceLinkedTemplatesSidebar({
  source,
  onClose,
}: DataSourceLinkedTemplatesSidebarProps) {
  const { data, isLoading, isError } = useDataSourceTemplates(source?.id ?? null);
  const templates = useMemo(
    () =>
      [...(data?.data ?? [])]
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
        .map((template) => ({
          ...template,
          clients: [...(template.clients ?? [])]
            .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
            .map((client) => ({
              ...client,
              deductibles: [...(client.deductibles ?? [])].sort((a, b) =>
                a.name.localeCompare(b.name, "pt-BR"),
              ),
            })),
        })),
    [data?.data],
  );

  const content = isLoading ? (
    <div className="flex justify-center py-12">
      <Spinner size="lg" color="primary" />
    </div>
  ) : isError ? (
    <p role="alert" className="text-sm text-danger">
      Não foi possível carregar os vínculos desta fonte.
    </p>
  ) : templates.length === 0 ? (
    <p className="text-sm text-default-400">Nenhum modelo vinculado</p>
  ) : (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-default-500">Modelos de Background Check com esta fonte</p>
      <ExpandableClientList
        clients={templates}
        emptyMessage="Nenhum modelo vinculado"
        titleClassName="text-sm font-medium text-default-800"
        collapsedChevron="left"
        chevronSize={18}
        panelClassName="px-5 pb-4 space-y-2 border-t border-default-200"
        renderPanel={(template) => (
          <>
            {template.clients.length === 0 ? (
              <p className="pt-3 text-sm text-default-400">
                Nenhum cliente ou franquia utiliza este modelo de Background Check.
              </p>
            ) : (
              <>
                <p className="pt-3 text-xs text-default-500">
                  Clientes e franquias com este modelo
                </p>
                {template.clients.map((client) => (
                  <div key={client.id} className="rounded-lg bg-default-100 px-4 py-3 space-y-1">
                    <p className="text-sm font-medium text-default-700">{client.name}</p>
                    {client.deductibles.map((franchise) => (
                      <p key={franchise.id} className="text-sm text-default-500">
                        {franchise.name}
                      </p>
                    ))}
                  </div>
                ))}
              </>
            )}
          </>
        )}
      />
    </div>
  );

  return (
    <DynamicDrawer
      size="md"
      title={source?.name ?? "Vínculos da fonte"}
      isOpen={Boolean(source)}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      component={content}
    />
  );
}
