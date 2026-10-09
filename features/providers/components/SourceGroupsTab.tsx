"use client";

import {
  formatReferenceCostDisplay,
  parseReferenceCost,
  sumEligibleReferenceCosts,
} from "@/features/background-check-templates-preview/utils/referenceCost";
import { toSourceGroupFormSourceFromDataSource } from "../utils/sourceGroupFormSource.utils";
import { DeleteConfirmModal } from "@/shared/components/DeleteConfirmModal";
import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { formatCurrency } from "@/shared/utils/currency";
import type { ErrorResponse } from "@/shared/utils/errorParser";
import { Button, Input, Pagination, Spinner, Tooltip, addToast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { CirclePlus, Info, Link, Pencil, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAssignBundleDataSources } from "../hooks/useAssignBundleDataSources";
import { useBundleLinkedClients } from "../hooks/useBundleLinkedClients";
import { useCreateDataSourceBundle } from "../hooks/useCreateDataSourceBundle";
import { useDeleteDataSourceBundle } from "../hooks/useDeleteDataSourceBundle";
import { useDataSourceBundle } from "../hooks/useDataSourceBundle";
import { useDataSourceBundles } from "../hooks/useDataSourceBundles";
import { useDataSources } from "../hooks/useDataSources";
import { usePatchDataSourceBundleActive } from "../hooks/usePatchDataSourceBundleActive";
import { useRemoveBundleDataSources } from "../hooks/useRemoveBundleDataSources";
import { useUpdateDataSourceBundle } from "../hooks/useUpdateDataSourceBundle";
import type {
  DataSourceBundle,
  DataSourceBundleResponse,
  SourceGroupFormData,
  SourceGroupFormSnapshot,
} from "../types/data-source-bundles.types";
import { diffIds } from "../utils/bundleFormDiff.utils";
import {
  buildProviderNameColumn,
  buildProviderStatusColumn,
  providerDrawerFooterClass,
  providerDrawerPrimaryButtonClass,
  providerDrawerSecondaryButtonClass,
  providerTableClassNames,
} from "../utils/providersTableColumns.shared";
import { BundleLinkedClientsSidebar } from "./BundleLinkedClientsSidebar";
import { SourceGroupForm } from "./SourceGroupForm";

type DrawerMode = "create" | "edit";

type DataSourceBundleRow = DataSourceBundleResponse;

interface BundleLinkButtonProps {
  bundle: DataSourceBundle;
  onOpen: (bundle: DataSourceBundle) => void;
}

/**
 * Ícone de vínculo por linha. Verifica se o grupo possui clientes vinculados
 * para habilitar o clique (abre a sidebar) ou exibir tooltip quando não houver.
 */
function BundleLinkButton({ bundle, onOpen }: BundleLinkButtonProps) {
  const { data, isLoading } = useBundleLinkedClients(bundle.id);
  const hasClients = (data?.pagination.totalRecords ?? 0) > 0;

  if (isLoading) {
    return (
      <button
        type="button"
        disabled
        aria-label="Carregando vínculos"
        className="text-default-300 p-1 rounded-full cursor-progress"
      >
        <Link size={18} />
      </button>
    );
  }

  if (!hasClients) {
    return (
      <Tooltip content="Este grupo não possui vínculo com nenhum cliente" placement="top" showArrow>
        <span className="inline-flex">
          <button
            type="button"
            disabled
            aria-disabled
            aria-label="Grupo sem clientes vinculados"
            className="text-default-300 p-1 rounded-full cursor-not-allowed"
          >
            <Link size={18} />
          </button>
        </span>
      </Tooltip>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(bundle)}
      aria-label="Ver clientes vinculados"
      className="text-primary hover:text-primary-700 p-1 rounded-full hover:bg-primary-50 transition-all cursor-pointer"
    >
      <Link size={18} />
    </button>
  );
}

const INITIAL_FORM_DATA: SourceGroupFormData = {
  isActive: true,
  name: "",
  productIds: [],
  selectedSources: [],
};

function sumBundleReferenceCost(
  bundle: DataSourceBundleResponse,
  referenceCostBySourceId: Map<string, unknown>,
) {
  return sumEligibleReferenceCosts(
    (bundle.dataSources ?? []).map((source) => {
      if (source.isActive === false) return null;
      const providerId = source.selectedProvider?.value ?? source.defaultProvider?.value;
      if (!providerId) return null;
      return parseReferenceCost(referenceCostBySourceId.get(source.id));
    }),
  );
}

function getGroupSaveErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<ErrorResponse>;
  const backendMessage = axiosError.response?.data?.message ?? axiosError.response?.data?.detail ?? "";
  if (
    axiosError.response?.status === 409 ||
    /duplicate|duplicad|já existe|already exists/i.test(backendMessage)
  ) {
    return "Já existe um grupo com este nome";
  }
  return backendMessage || "Não foi possível salvar o grupo de fontes. Tente novamente.";
}

/**
 * Aba de grupos de fontes do provedor.
 */
export function SourceGroupsTab() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerStep, setDrawerStep] = useState<1 | 2>(1);
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SourceGroupFormData>(INITIAL_FORM_DATA);
  const hydratedBundleIdRef = useRef<string | null>(null);
  const initialSnapshotRef = useRef<SourceGroupFormSnapshot>({
    isActive: true,
    dataSourceIds: [],
  });
  const [bundleToDelete, setBundleToDelete] = useState<DataSourceBundle | null>(null);
  const [linkedClientsBundle, setLinkedClientsBundle] = useState<DataSourceBundle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showProductError, setShowProductError] = useState(false);
  const [showNameError, setShowNameError] = useState(false);
  const [showSourceError, setShowSourceError] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");

  const { data: bundlesResponse, isLoading, isError } = useDataSourceBundles({
    page,
    pageSize,
    sortBy: "createdAt",
    sortDirection: "desc",
    search: groupSearch,
  });
  const { data: availableSourcesResponse } = useDataSources({ pageSize: 100, isActive: true });

  const { data: bundleDetail, isLoading: isBundleLoading } = useDataSourceBundle(editingBundleId, {
    enabled: isDrawerOpen && drawerMode === "edit" && Boolean(editingBundleId),
  });

  const createBundle = useCreateDataSourceBundle();
  const deleteBundle = useDeleteDataSourceBundle();
  const updateBundle = useUpdateDataSourceBundle();
  const patchBundleActive = usePatchDataSourceBundleActive();
  const assignDataSources = useAssignBundleDataSources();
  const removeDataSources = useRemoveBundleDataSources();

  const bundles = bundlesResponse?.data ?? [];
  const referenceCostBySourceId = useMemo(() => {
    const costs = new Map<string, unknown>();
    for (const source of availableSourcesResponse?.data ?? []) {
      costs.set(source.id, source.referenceCost);
    }
    return costs;
  }, [availableSourcesResponse?.data]);
  const pagination = isError ? undefined : bundlesResponse?.pagination;
  const hasProducts = formData.productIds.length > 0;
  const hasSources = formData.selectedSources.length > 0;

  useEffect(() => {
    if (hasProducts) {
      setShowProductError(false);
    }
  }, [hasProducts]);

  useEffect(() => {
    if (hasSources) {
      setShowSourceError(false);
    }
  }, [hasSources]);

  useEffect(() => {
    if (
      !bundleDetail ||
      !isDrawerOpen ||
      drawerMode !== "edit" ||
      hydratedBundleIdRef.current === editingBundleId
    ) return;

    const dataSources = bundleDetail.dataSources ?? [];
    hydratedBundleIdRef.current = editingBundleId;
    const dataSourceIds = dataSources.map((source) => source.id);
    const catalog = availableSourcesResponse?.data ?? [];
    initialSnapshotRef.current = {
      isActive: bundleDetail.isActive,
      dataSourceIds,
    };
    setFormData({
      isActive: bundleDetail.isActive,
      name: bundleDetail.name,
      productIds: (bundleDetail.products ?? []).map((product) => product.value),
      selectedSources: dataSources.map((source) => {
        const meta = catalog.find((item) => item.id === source.id);
        if (meta) {
          return toSourceGroupFormSourceFromDataSource(meta);
        }
        const referenceCost =
          parseReferenceCost(referenceCostBySourceId.get(source.id)) ?? 0;
        return {
          id: source.id,
          name: source.name,
          referenceCost,
          realCost: referenceCost,
        };
      }),
    });
  }, [
    bundleDetail,
    isDrawerOpen,
    drawerMode,
    editingBundleId,
    availableSourcesResponse?.data,
    referenceCostBySourceId,
  ]);

  const handleActiveChange = useCallback(
    async (isActive: boolean) => {
      if (drawerMode !== "edit" || !editingBundleId) {
        setFormData((prev) => ({ ...prev, isActive }));
        return;
      }

      try {
        await patchBundleActive.mutateAsync({
          id: editingBundleId,
          data: { isActive },
        });
        setFormData((prev) => ({ ...prev, isActive }));
        initialSnapshotRef.current = {
          ...initialSnapshotRef.current,
          isActive,
        };
      } catch {
        // The status remains at the last confirmed API value.
      }
    },
    [drawerMode, editingBundleId, patchBundleActive],
  );

  const resetDrawer = useCallback(() => {
    setEditingBundleId(null);
    hydratedBundleIdRef.current = null;
    setDrawerStep(1);
    setFormData(INITIAL_FORM_DATA);
    setShowProductError(false);
    setShowNameError(false);
    setShowSourceError(false);
    initialSnapshotRef.current = { isActive: true, dataSourceIds: [] };
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    resetDrawer();
  }, [resetDrawer]);

  const handleNewGroup = useCallback(() => {
    resetDrawer();
    setDrawerMode("create");
    setDrawerStep(1);
    setIsDrawerOpen(true);
  }, [resetDrawer]);

  const handleEditGroup = useCallback((bundle: DataSourceBundle) => {
    hydratedBundleIdRef.current = null;
    setFormData(INITIAL_FORM_DATA);
    setEditingBundleId(bundle.id);
    setDrawerMode("edit");
    setDrawerStep(1);
    setIsDrawerOpen(true);
  }, []);

  const handleDeleteGroup = useCallback((bundle: DataSourceBundle) => {
    setBundleToDelete(bundle);
  }, []);

  const handleViewLinkedClients = useCallback((bundle: DataSourceBundle) => {
    setLinkedClientsBundle(bundle);
  }, []);

  const handleProceed = useCallback(() => {
    const missingName = !formData.name.trim();
    const missingProducts = !hasProducts;

    if (missingName || missingProducts) {
      setShowNameError(missingName);
      if (missingProducts) {
        setShowProductError(true);
      }
      return;
    }
    setShowNameError(false);
    setDrawerStep(2);
  }, [formData.name, hasProducts]);

  const refreshBundleData = useCallback(async (bundleId?: string) => {
    await queryClient.refetchQueries(
      { queryKey: ["data-source-bundles"] },
      { throwOnError: true },
    );
    if (bundleId) {
      await queryClient.refetchQueries(
        { queryKey: ["data-source-bundles", bundleId] },
        { throwOnError: true },
      );
    }
  }, [queryClient]);

  const handleSave = useCallback(async (saveSources: boolean) => {
    if (saveSources && !hasSources) {
      setShowSourceError(true);
      return;
    }

    const dataSourceIds = formData.selectedSources.map((s) => s.id);
    let savedBundleId = editingBundleId ?? undefined;
    let serverChanged = false;
    let hasPartialResult = false;

    setIsSaving(true);
    try {
      if (drawerMode === "create") {
        const created = await createBundle.mutateAsync({
          name: formData.name,
          isActive: formData.isActive,
          productIds: formData.productIds,
        });
        savedBundleId = created.id;
        serverChanged = true;
        setEditingBundleId(created.id);
        setDrawerMode("edit");
        hydratedBundleIdRef.current = created.id;
        initialSnapshotRef.current = { isActive: formData.isActive, dataSourceIds: [] };

        if (saveSources && dataSourceIds.length > 0) {
          const status = await assignDataSources.mutateAsync({
            id: created.id,
            data: { dataSourceIds },
          });
          hasPartialResult ||= status === 206;
        }
      } else if (editingBundleId) {
        await updateBundle.mutateAsync({
          id: editingBundleId,
          data: {
            name: formData.name,
            productIds: formData.productIds,
          },
        });
        serverChanged = true;

        if (saveSources) {
          const { added, removed } = diffIds(dataSourceIds, initialSnapshotRef.current.dataSourceIds);

          if (added.length > 0) {
            const status = await assignDataSources.mutateAsync({
              id: editingBundleId,
              data: { dataSourceIds: added },
            });
            hasPartialResult ||= status === 206;
            serverChanged = true;
          }

          if (removed.length > 0) {
            const status = await removeDataSources.mutateAsync({
              id: editingBundleId,
              data: { dataSourceIds: removed },
            });
            hasPartialResult ||= status === 206;
            serverChanged = true;
          }
        }
      }

      if (hasPartialResult) {
        try {
          await refreshBundleData(savedBundleId);
        } catch {
          // Keep the draft open; the list and detail queries retain their error state.
        }
        addToast({
          title: "Atualização parcial",
          description: "Parte das fontes não foi atualizada. Revise os dados retornados antes de tentar novamente.",
          color: "warning",
        });
        return;
      }

      try {
        await refreshBundleData(savedBundleId);
      } catch {
        addToast({
          title: "Grupo salvo",
          description: "Os dados foram salvos, mas a listagem não foi atualizada. Tente recarregar os dados.",
          color: "warning",
        });
        return;
      }

      addToast({
        title: "Grupo salvo",
        description: "O grupo de fontes foi salvo com sucesso.",
        color: "success",
      });
      setIsDrawerOpen(false);
      resetDrawer();
    } catch (error) {
      if (serverChanged) {
        try {
          await refreshBundleData(savedBundleId);
        } catch {
          // Keep the user's draft and report the mutation failure below.
        }
      }
      addToast({
        title: "Erro ao salvar grupo",
        description: getGroupSaveErrorMessage(error),
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    drawerMode,
    editingBundleId,
    formData,
    hasSources,
    createBundle,
    updateBundle,
    assignDataSources,
    removeDataSources,
    refreshBundleData,
    resetDrawer,
  ]);

  const drawerTitle = drawerMode === "edit" ? "Editar grupo de fontes" : "Novo grupo de fontes";

  const isFormReady = drawerMode === "create" || (!isBundleLoading && Boolean(bundleDetail));

  const allColumns = useMemo<ColumnConfig<DataSourceBundleRow>[]>(
    () => [
      {
        ...buildProviderStatusColumn<DataSourceBundleRow>(),
        align: "start",
        width: 80,
      },
      {
        ...buildProviderNameColumn<DataSourceBundleRow>(),
        align: "start",
        width: 300,
      },
      {
        id: "products",
        label: "Produtos",
        align: "start",
        width: 120,
        render: (_, row) => {
          const products = row.products ?? [];
          if (products.length === 0) return <span>—</span>;
          if (products.length === 1) return <span>{products[0].label}</span>;
          return (
            <div className="flex items-center gap-1">
              <span>{products.length} produtos</span>
              <Tooltip
                content={
                  <ul>
                    {products.map((product) => (
                      <li key={product.value}>{product.label}</li>
                    ))}
                  </ul>
                }
                placement="top"
                showArrow
              >
                <button
                  type="button"
                  aria-label={`Produtos de ${row.name}`}
                  className="text-primary"
                >
                  <Info size={16} aria-hidden="true" />
                </button>
              </Tooltip>
            </div>
          );
        },
      },
      {
        id: "referenceCost",
        label: "Custo de referência (R$)",
        align: "start",
        width: 110,
        render: (_, row) => (
          <span>
            {formatReferenceCostDisplay(sumBundleReferenceCost(row, referenceCostBySourceId))}
          </span>
        ),
      },
      {
        id: "actualCost",
        label: "Custo real (R$)",
        align: "start",
        width: 110,
        render: (value) => <span>{value == null ? "—" : formatCurrency(value)}</span>,
      },
      {
        id: "dataSourceCount",
        label: "Fontes",
        align: "start",
        width: 80,
        render: (_, row) => {
          const sources = row.dataSources ?? [];
          return (
            <div className="flex items-center gap-1">
              <span>{row.dataSourceCount ?? sources.length}</span>
              {sources.length > 0 && (
                <Tooltip
                  content={
                    <ul>
                      {sources.map((source) => (
                        <li key={source.id}>
                          {source.name}
                          {"isActive" in source && source.isActive === false ? " (Inativa)" : ""}
                        </li>
                      ))}
                    </ul>
                  }
                  placement="top"
                  showArrow
                >
                  <button
                    type="button"
                    aria-label={`Fontes de ${row.name}`}
                    className="text-primary"
                  >
                    <Info size={16} aria-hidden="true" />
                  </button>
                </Tooltip>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        label: "Ações",
        align: "start",
        width: 110,
        render: (_, row) => (
          <div className="flex items-center justify-start gap-3">
            <BundleLinkButton bundle={row} onOpen={handleViewLinkedClients} />
            <button
              type="button"
              onClick={() => handleEditGroup(row)}
              className="text-primary hover:text-primary-700 p-1 rounded-full hover:bg-primary-50 transition-all cursor-pointer"
              aria-label="Editar grupo"
            >
              <Pencil size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleDeleteGroup(row)}
              className="text-danger hover:text-danger-600 p-1 rounded-full hover:bg-danger-50 transition-all cursor-pointer"
              aria-label="Excluir grupo"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
      },
    ],
    [handleEditGroup, handleDeleteGroup, handleViewLinkedClients, referenceCostBySourceId],
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          aria-label="Pesquisar grupos"
          placeholder="Pesquise por grupo ou fonte"
          value={groupSearch}
          onValueChange={(value) => {
            setGroupSearch(value);
            setPage(1);
          }}
          className="w-full max-w-[300px]"
          classNames={defaultInputClassNames}
          startContent={<Search className="text-gray-400" size={20} />}
        />
        <Button
          startContent={<CirclePlus size={18} className="shrink-0" />}
          radius="sm"
          color="primary"
          onPress={handleNewGroup}
          className="shrink-0"
        >
          Novo grupo
        </Button>
      </div>

      {isError ? (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar os grupos de fontes.
        </p>
      ) : (
        <DynamicTable
          columns={allColumns}
          data={bundles}
          isLoading={isLoading}
          keyExtractor={(row) => row.id}
          emptyMessage="Nenhum grupo de fontes encontrado"
          classNames={providerTableClassNames}
        />
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-default-100">
        <p className="text-sm text-default-500">
          Mostrando <span className="font-semibold text-default-700">{isError ? 0 : bundles.length}</span>{" "}
          de <span className="font-semibold text-default-700">{pagination?.totalRecords ?? 0}</span>{" "}
          grupos
        </p>

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={pagination.totalPages}
            onChange={setPage}
            className="font-sans"
          />
        )}
      </div>

      <DynamicDrawer
        size="xl"
        title={drawerTitle}
        isOpen={isDrawerOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDrawer();
        }}
        classNames={{
          body: "flex-1! mb-0",
          footer: "border-t-0",
        }}
        component={
          drawerMode === "edit" && isBundleLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" color="primary" />
            </div>
          ) : (
            <SourceGroupForm
              step={drawerStep}
              formData={formData}
              onFormDataChange={setFormData}
              isLoading={false}
              isEditMode={drawerMode === "edit"}
              onActiveChange={handleActiveChange}
              isPatchingActive={patchBundleActive.isPending}
              showNameError={showNameError}
              showProductError={showProductError}
              showSourceError={showSourceError}
            />
          )
        }
        footer={
          <div className={`${providerDrawerFooterClass} font-sans`}>
            {drawerStep === 2 && (
              <Button
                variant="light"
                onPress={() => setDrawerStep(1)}
                isDisabled={isSaving}
                className={providerDrawerSecondaryButtonClass}
              >
                Voltar
              </Button>
            )}
            {drawerStep === 1 && (
              <Button
                variant="light"
                onPress={handleCloseDrawer}
                isDisabled={isSaving}
                className={providerDrawerSecondaryButtonClass}
              >
                Cancelar
              </Button>
            )}
            {drawerStep === 1 && drawerMode === "edit" && (
              <Button
                variant="light"
                onPress={() => handleSave(false)}
                isLoading={isSaving}
                isDisabled={!isFormReady || isSaving}
                className={providerDrawerSecondaryButtonClass}
              >
                Salvar e sair
              </Button>
            )}
            <Button
              color="primary"
              onPress={drawerStep === 1 ? handleProceed : () => handleSave(true)}
              isLoading={isSaving}
              isDisabled={!isFormReady || isSaving}
              className={providerDrawerPrimaryButtonClass}
            >
              {drawerStep === 1 ? "Prosseguir" : "Salvar grupo"}
            </Button>
          </div>
        }
      />

      <DynamicDrawer
        size="md"
        title={linkedClientsBundle?.name ?? "Clientes vinculados"}
        isOpen={Boolean(linkedClientsBundle)}
        onOpenChange={(open) => {
          if (!open) setLinkedClientsBundle(null);
        }}
        component={
          <BundleLinkedClientsSidebar
            key={linkedClientsBundle?.id ?? "closed"}
            bundle={linkedClientsBundle}
          />
        }
      />

      <DeleteConfirmModal<DataSourceBundle>
        isOpen={Boolean(bundleToDelete)}
        onClose={() => setBundleToDelete(null)}
        record={bundleToDelete}
        getRecordLabel={(b) => b.name}
        entityLabel="grupo"
        confirmLabel="Excluir grupo"
        showSuccessToast={false}
        description={
          <p className="text-left">
            Ao excluir este grupo, ele será removido de todos os clientes vinculados a ele
          </p>
        }
        onConfirm={async (bundle) => {
          await deleteBundle.mutateAsync(bundle.id);
        }}
      />
    </div>
  );
}
