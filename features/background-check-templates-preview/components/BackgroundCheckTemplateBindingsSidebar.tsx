"use client";

import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { Accordion, AccordionItem } from "@heroui/react";
import type { BackgroundCheckTemplatePreviewRow } from "../types/backgroundCheckTemplatePreview.types";

export type BackgroundCheckTemplateBindingsSidebarProps = {
  isOpen: boolean;
  template: BackgroundCheckTemplatePreviewRow | null;
  onClose: () => void;
};

function BindingsContent({ template }: { template: BackgroundCheckTemplatePreviewRow | null }) {
  const clients = template?.bindings ?? [];

  return (
    <div className="flex min-h-0 max-h-[calc(100vh-10rem)] flex-col gap-4 overflow-y-auto pr-1">
      <div>
        <p className="text-sm font-semibold text-default-700">Clientes com este modelo</p>
      </div>

      {clients.length === 0 ? (
        <p className="text-sm text-default-500">Sem clientes vinculados a este modelo</p>
      ) : (
        <Accordion
          selectionMode="single"
          variant="light"
          className="gap-0 overflow-hidden rounded-lg border border-default-200 px-0"
          dividerProps={{ className: "hidden" }}
          itemClasses={{
            base: "border-b border-default-200 last:border-b-0",
            title: "text-sm font-normal text-default-800",
            trigger: "min-h-10 px-4 py-2",
            content: "px-3 pb-3 pt-0",
            indicator: "text-default-500",
          }}
        >
          {clients.map((client) => (
            <AccordionItem
              key={client.id}
              aria-label={client.name}
              title={<span className="text-sm font-medium">{client.name}</span>}
            >
              <div className="flex flex-col gap-3 pb-2">
                <p className="text-sm text-default-700">Franquias e usuários deste modelo</p>
                {client.franchises.length === 0 ? (
                  <p className="text-sm text-default-500">Nenhuma franquia vinculada</p>
                ) : (
                  client.franchises.map((franchise) => (
                    <section
                      key={franchise.id}
                      aria-label={`Franquia ${franchise.name}`}
                      className="rounded-lg bg-default-50 p-3"
                    >
                      <p className="text-sm text-default-800">{franchise.name}</p>
                      {franchise.users.length === 0 ? (
                        <p className="mt-2 text-sm text-default-500">Nenhum usuário vinculado</p>
                      ) : (
                        <ul className="mt-2 flex flex-col gap-2">
                          {franchise.users.map((user) => (
                            <li key={user.id} className="text-sm text-default-600">
                              {user.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))
                )}
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}

export function BackgroundCheckTemplateBindingsSidebar({
  isOpen,
  template,
  onClose,
}: BackgroundCheckTemplateBindingsSidebarProps) {
  return (
    <DynamicDrawer
      size="xl"
      title={template?.name ?? "Vínculos do modelo"}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      classNames={{ body: "flex-1! mb-0 min-h-0" }}
      component={<BindingsContent template={template} />}
    />
  );
}
