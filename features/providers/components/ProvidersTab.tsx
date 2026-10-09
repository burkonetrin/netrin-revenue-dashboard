"use client";

import { DeleteConfirmModal } from "@/shared/components/DeleteConfirmModal";
import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { DrawerFormFooter } from "@/shared/components/DynamicDrawer/DrawerFormFooter";
import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { TableListFooter } from "@/shared/components/table/TableListFooter";
import { type ErrorResponse, getErrorMessage } from "@/shared/utils/errorParser";
import { Button, addToast } from "@heroui/react";
import type { AxiosError } from "axios";
import { CirclePlus, Trash2 } from "lucide-react";
import { PROVIDERS_BASE_PATH } from "@/constants";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCreateProvider } from "../hooks/useCreateProvider";
import { useDeleteProvider } from "../hooks/useDeleteProvider";
import { useProviders } from "../hooks/useProviders";
import type { Provider, ProviderFormState } from "../types/providers.types";
import { mapFormToCreateRequest } from "../utils/providerForm.utils";
import { getProviderServiceLabel, getProviderTypeLabel } from "../utils/providerList.utils";
import { providerTableClassNames } from "../utils/providersTableColumns.shared";
import { PROVIDER_FORM_ID, ProviderForm } from "./ProviderForm";

type ProviderWithVirtualColumns = Provider & {
  delete?: never;
};

/**
 * Aba de listagem e create drawer de fornecedores.
 * Clique no nome navega para `/providers/[id]` (DET-01).
 * Edição do cadastro ocorre na página de detalhes (Editar detalhes).
 *
 * SUP-10 / AD-005: sem chaves RBAC granulares — ações ficam visíveis.
 */
export function ProvidersTab() {
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<Provider | null>(null);

  const deleteProvider = useDeleteProvider();
  const createProvider = useCreateProvider();

  const {
    data: providersResponse,
    isLoading,
    error,
  } = useProviders({
    page,
    pageSize: 10,
  });

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleNewProvider = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const handleRequestDelete = useCallback((provider: Provider) => {
    setProviderToDelete(provider);
  }, []);

  const handleSubmit = useCallback(
    async (form: ProviderFormState) => {
      try {
        await createProvider.mutateAsync(mapFormToCreateRequest(form));
        addToast({
          title: "Fornecedor criado",
          description: "O fornecedor foi cadastrado com sucesso.",
          color: "success",
        });
        handleCloseDrawer();
      } catch (err) {
        const message = getErrorMessage((err as AxiosError<ErrorResponse>) ?? null);
        addToast({
          title: "Erro ao criar fornecedor",
          description: message || "Ocorreu um erro ao salvar o fornecedor.",
          color: "danger",
        });
      }
    },
    [createProvider, handleCloseDrawer],
  );

  const columns = useMemo<ColumnConfig<ProviderWithVirtualColumns>[]>(
    () => [
      {
        id: "name",
        label: "Fornecedor",
        render: (value, row) => (
          <Link
            to={`${PROVIDERS_BASE_PATH}/${row.id}`}
            className="text-primary hover:underline font-medium text-left"
          >
            {String(value)}
          </Link>
        ),
      },
      {
        id: "providerType",
        label: "Tipo",
        render: (_, row) => getProviderTypeLabel(row),
      },
      {
        id: "service",
        label: "Serviço",
        render: (_, row) => getProviderServiceLabel(row),
      },
      {
        id: "delete",
        label: "Excluir",
        align: "end",
        width: 80,
        render: (_, row) => (
          <div className="w-full flex justify-center">
            <button
              type="button"
              className="cursor-pointer text-danger hover:text-danger-600 transition-colors"
              aria-label={`Excluir ${row.name}`}
              onClick={(event) => {
                event.stopPropagation();
                handleRequestDelete(row);
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
      },
    ],
    [handleRequestDelete],
  );

  const providers = providersResponse?.data ?? [];
  const pagination = providersResponse?.pagination;
  const errorMessage = getErrorMessage((error as AxiosError<ErrorResponse> | null) ?? null);
  const isSaving = createProvider.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-start">
        <Button
          startContent={<CirclePlus size={18} className="shrink-0" />}
          radius="sm"
          color="primary"
          onPress={handleNewProvider}
        >
          Novo fornecedor
        </Button>
      </div>

      {errorMessage && <p className="text-sm text-danger-500">{errorMessage}</p>}

      <DynamicTable
        columns={columns}
        data={providers}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhum fornecedor encontrado"
        classNames={providerTableClassNames}
      />

      <TableListFooter
        shownCount={providers.length}
        totalCount={pagination?.totalRecords ?? 0}
        entityLabel="fornecedores"
        page={page}
        totalPages={pagination?.totalPages}
        onPageChange={setPage}
        variant="providers"
      />

      <DynamicDrawer
        size="lg"
        title="Novo fornecedor"
        isOpen={isDrawerOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseDrawer();
          }
        }}
        classNames={{
          body: "flex-1! mb-0",
          footer: "border-t-0",
        }}
        component={<ProviderForm key="create" mode="create" onSubmit={handleSubmit} />}
        footer={
          <DrawerFormFooter
            variant="providers"
            formId={PROVIDER_FORM_ID}
            onCancel={handleCloseDrawer}
            isLoading={isSaving}
            isCancelDisabled={isSaving}
            saveLabel="Salvar"
          />
        }
      />

      <DeleteConfirmModal<Provider>
        isOpen={Boolean(providerToDelete)}
        onClose={() => setProviderToDelete(null)}
        record={providerToDelete}
        getRecordLabel={(provider) => provider.name}
        entityLabel="fornecedor"
        confirmLabel="Excluir fornecedor"
        description={<p>Deseja realmente excluir este fornecedor?</p>}
        onConfirm={async (provider) => {
          await deleteProvider.mutateAsync(provider.id);
        }}
      />
    </div>
  );
}
