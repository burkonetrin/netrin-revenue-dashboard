"use client";

import { ClientPaginatedTableFooter } from "@/components/clientes-mock-hero/ClientPaginatedTableFooter";
import { DeleteConfirmModal } from "@/shared/components/DeleteConfirmModal";
import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { maskBrazilianPhone } from "@/shared/utils/phone";
import { Button } from "@heroui/react";
import { CirclePlus, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useDeleteContact } from "../hooks/useDeleteContact";
import { useListContacts } from "../hooks/useListContacts";
import { useContactsStore } from "../store/contacts.store";
import {
  CONTACT_TYPE_LABELS,
  type Contact,
  type ContactType,
} from "../types/contacts.types";
import { ContactFormDrawer } from "./ContactFormDrawer";

type ContactTypeCellValue =
  | ContactType
  | { label?: string; value?: ContactType };

interface ClientContactsTabProps {
  clientId: string;
}

export function ClientContactsTab({ clientId }: ClientContactsTabProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: contactsResponse, isLoading } = useListContacts(clientId, {
    page,
    pageSize,
  });
  const contacts = contactsResponse?.data ?? [];
  const pagination = contactsResponse?.pagination;

  const {
    contactToDelete,
    openDeleteModal,
    closeDeleteModal,
    openCreateContactDrawer,
    openEditContactDrawer,
  } = useContactsStore();
  const deleteContact = useDeleteContact();

  const columns: ColumnConfig<Contact>[] = useMemo(
    () => [
      { id: "name", label: "Nome", sortable: true },
      { id: "email", label: "E-mail", sortable: true },
      {
        id: "phone",
        label: "Telefone",
        sortable: true,
        render: (value: string | null) => (value ? maskBrazilianPhone(value) : "—"),
      },
      {
        id: "contactType",
        label: "Tipo de contato",
        sortable: true,
        render: (value: ContactTypeCellValue) => {
          if (typeof value === "object" && value !== null) {
            return value.label ?? (value.value ? CONTACT_TYPE_LABELS[value.value] : "—");
          }
          return CONTACT_TYPE_LABELS[value] ?? value ?? "—";
        },
      },
      {
        id: "receivesNfe",
        label: "Recebe NF-e",
        sortable: true,
        render: (value: boolean | undefined) => (value ? "Sim" : "Não"),
      },
      {
        id: "receivesBoletos",
        label: "Recebe boletos",
        sortable: true,
        render: (value: boolean | undefined) => (value ? "Sim" : "Não"),
      },
      {
        id: "actions",
        label: "Ações",
        width: 90,
        align: "center",
        render: (_: unknown, row: Contact) => (
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              className="text-primary hover:text-primary-600 transition-colors cursor-pointer"
              aria-label="Editar contato"
              onClick={(e) => {
                e.stopPropagation();
                openEditContactDrawer(row);
              }}
            >
              <Pencil size={20} />
            </button>
            <button
              type="button"
              className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              aria-label="Excluir contato"
              onClick={(e) => {
                e.stopPropagation();
                openDeleteModal(row);
              }}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ),
      },
    ],
    [openDeleteModal, openEditContactDrawer],
  );

  return (
    <div className="mt-4">
      <div className="mb-5">
        <Button
          startContent={<CirclePlus size={20} className="shrink-0" />}
          radius="sm"
          color="primary"
          onPress={openCreateContactDrawer}
          className="px-8"
        >
          Novo Contato
        </Button>
      </div>

      <DynamicTable
        columns={columns}
        data={contacts}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhum contato encontrado"
        classNames={{
          th: "bg-gray-50 text-gray-700 font-semibold text-xs",
          td: "text-gray-900 border-b border-gray-200 h-12 text-xs",
        }}
      />

      <ClientPaginatedTableFooter
        visibleCount={contacts.length}
        pagination={pagination}
        entityLabel="contatos"
        page={page}
        onPageChange={setPage}
      />

      <ContactFormDrawer clientId={clientId} />

      <DeleteConfirmModal<Contact>
        isOpen={Boolean(contactToDelete)}
        onClose={closeDeleteModal}
        record={contactToDelete}
        getRecordLabel={(item) => item.name}
        entityLabel="contato"
        description={<p>Deseja realmente excluir este contato?</p>}
        confirmLabel="Excluir contato"
        onConfirm={async (item) => {
          await deleteContact.mutateAsync({
            clientId,
            contactId: item.id,
          });
        }}
      />
    </div>
  );
}
