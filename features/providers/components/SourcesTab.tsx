"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Spinner } from "@heroui/react";
import { Pencil } from "lucide-react";
import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { DrawerFormFooter } from "@/shared/components/DynamicDrawer/DrawerFormFooter";
import { TableListFooter } from "@/shared/components/table/TableListFooter";
import { useDataSources } from "../hooks/useDataSources";
import { useDataSource } from "../hooks/useDataSource";
import { useUpdateDataSource } from "../hooks/useUpdateDataSource";
import { usePatchDataSourceActive } from "../hooks/usePatchDataSourceActive";
import { useProviders } from "../hooks/useProviders";
import { EditSourceForm } from "./EditSourceForm";
import type { DataSource, EditSourceFormData } from "../types/data-sources.types";
import { pathNameToDisplay, displayToPathName } from "../utils/pathName.utils";
import {
  buildProviderDescriptionColumn,
  buildProviderIdColumn,
  buildProviderInternalNameColumn,
  buildProviderNameColumn,
  buildProviderStatusColumn,
  providerTableClassNames,
} from "../utils/providersTableColumns.shared";

const INITIAL_FORM_DATA: EditSourceFormData = {
  isActive: true,
  name: "",
  description: "",
  internalName: "",
  pathDisplay: "",
};

/**
 * Aba de fontes de dados do provedor.
 */
export function SourcesTab() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "id",
    "isActive",
    "name",
    "description",
    "internalName",
    "edit",
  ]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditSourceFormData>(INITIAL_FORM_DATA);
  const initialIsActiveRef = useRef(true);
  const [isSaving, setIsSaving] = useState(false);

  const { data: sourcesResponse, isLoading } = useDataSources({
    page,
    pageSize,
  });

  const { data: sourceDetail, isLoading: isSourceLoading } =
    useDataSource(editingSourceId);

  const { data: providersResponse, isLoading: isProvidersLoading } = useProviders(
    {
      dataSourceId: editingSourceId ?? undefined,
      pageSize: 100,
    },
    { enabled: isDrawerOpen && Boolean(editingSourceId) },
  );

  const updateDataSource = useUpdateDataSource();
  const patchDataSourceActive = usePatchDataSourceActive();

  const sources = sourcesResponse?.data ?? [];
  const pagination = sourcesResponse?.pagination;
  const linkedProviders = providersResponse?.data ?? [];

  useEffect(() => {
    if (!sourceDetail || !isDrawerOpen) return;

    initialIsActiveRef.current = sourceDetail.isActive;
    setFormData({
      isActive: sourceDetail.isActive,
      name: sourceDetail.name,
      description: sourceDetail.description ?? "",
      internalName: sourceDetail.internalName,
      pathDisplay: pathNameToDisplay(sourceDetail.pathName),
    });
  }, [sourceDetail, isDrawerOpen]);

  const resetDrawer = useCallback(() => {
    setEditingSourceId(null);
    setFormData(INITIAL_FORM_DATA);
    initialIsActiveRef.current = true;
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    resetDrawer();
  }, [resetDrawer]);

  const handleEditSource = useCallback((source: DataSource) => {
    setFormData(INITIAL_FORM_DATA);
    setEditingSourceId(source.id);
    setIsDrawerOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editingSourceId) return;

    setIsSaving(true);
    try {
      await updateDataSource.mutateAsync({
        id: editingSourceId,
        data: {
          name: formData.name,
          description: formData.description,
          internalName: formData.internalName,
          pathName: displayToPathName(formData.pathDisplay),
        },
      });

      if (formData.isActive !== initialIsActiveRef.current) {
        await patchDataSourceActive.mutateAsync({
          id: editingSourceId,
          data: { isActive: formData.isActive },
        });
      }

      setIsDrawerOpen(false);
      resetDrawer();
    } catch {
      // toasts handled by mutation hooks
    } finally {
      setIsSaving(false);
    }
  }, [
    editingSourceId,
    formData,
    updateDataSource,
    patchDataSourceActive,
    resetDrawer,
  ]);

  const allColumns = useMemo<ColumnConfig<DataSource & { edit?: never }>[]>(
    () => [
      buildProviderIdColumn<DataSource & { edit?: never }>(),
      buildProviderStatusColumn<DataSource & { edit?: never }>(),
      buildProviderNameColumn<DataSource & { edit?: never }>(),
      buildProviderDescriptionColumn<DataSource & { edit?: never }>(),
      buildProviderInternalNameColumn<DataSource & { edit?: never }>(),
      {
        id: "edit",
        label: "Editar",
        align: "center",
        width: 40,
        render: (_, row) => (
          <button
            type="button"
            onClick={() => handleEditSource(row)}
            className="text-primary hover:text-primary-700 p-2 rounded-full hover:bg-primary-50 transition-all cursor-pointer"
          >
            <Pencil size={18} />
          </button>
        ),
      },
    ],
    [handleEditSource],
  );

  const displayedColumns = useMemo(() => {
    return allColumns.filter((col) => visibleColumns.includes(col.id as string));
  }, [allColumns, visibleColumns]);

  const isFormReady = !isSourceLoading && Boolean(sourceDetail);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="relative">
        <DynamicTable
          columns={displayedColumns}
          data={sources}
          isLoading={isLoading}
          keyExtractor={(row) => row.id}
          emptyMessage="Nenhuma fonte de dados encontrada"
          classNames={providerTableClassNames}
        />
      </div>

      <TableListFooter
        shownCount={sources.length}
        totalCount={pagination?.totalRecords ?? 0}
        entityLabel="fontes"
        page={page}
        totalPages={pagination?.totalPages}
        onPageChange={setPage}
        availableColumns={allColumns}
        selectedColumns={visibleColumns}
        onColumnsChange={setVisibleColumns}
        variant="providers"
      />

      <DynamicDrawer
        size="lg"
        title="Editar fonte"
        isOpen={isDrawerOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDrawer();
        }}
        component={
          isSourceLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" color="primary" />
            </div>
          ) : isFormReady ? (
            <EditSourceForm
              formData={formData}
              onFormDataChange={setFormData}
              providers={linkedProviders}
              isProvidersLoading={isProvidersLoading}
            />
          ) : null
        }
        footer={
          <DrawerFormFooter
            variant="providers"
            onCancel={handleCloseDrawer}
            onSave={handleSave}
            isLoading={isSaving}
            isCancelDisabled={isSaving}
            isSaveDisabled={!isFormReady || isSaving}
          />
        }
      />
    </div>
  );
}
