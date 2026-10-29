"use client";

import { providersSourceDetailPath } from "@/constants";
import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { DrawerFormFooter } from "@/shared/components/DynamicDrawer/DrawerFormFooter";
import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { TableListFooter } from "@/shared/components/table/TableListFooter";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { maskCurrency4, toApiDecimalString4, unmaskCurrency4 } from "@/shared/utils/currency";
import { Chip, Input, Spinner } from "@heroui/react";
import { Link as LinkIcon, Pencil, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDataSource } from "../hooks/useDataSource";
import { useDataSources } from "../hooks/useDataSources";
import { usePatchDataSourceActive } from "../hooks/usePatchDataSourceActive";
import { useProviders } from "../hooks/useProviders";
import { useUpdateDataSource } from "../hooks/useUpdateDataSource";
import type { DataSource, EditSourceFormData } from "../types/data-sources.types";
import { displayToPathName, pathNameToDisplay } from "../utils/pathName.utils";
import {
  buildProviderDescriptionColumn,
  buildProviderIdColumn,
  buildProviderInternalNameColumn,
  providerTableClassNames,
} from "../utils/providersTableColumns.shared";
import { formatSourceCurrency } from "../utils/sourceCurrency.utils";
import { DataSourceLinkedTemplatesSidebar } from "./DataSourceLinkedTemplatesSidebar";
import { EditSourceForm } from "./EditSourceForm";

const INITIAL_FORM_DATA: EditSourceFormData = {
  isActive: true,
  shortName: "",
  longName: "",
  name: "",
  description: "",
  shortDescription: "",
  longDescription: "",
  internalName: "",
  pathDisplay: "",
  referenceCost: "",
  contractCostsByProviderId: {},
  defaultProviderId: "",
};

/**
 * Aba de fontes de dados do provedor.
 */
export function SourcesTab() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [linkedSource, setLinkedSource] = useState<DataSource | null>(null);
  const [formData, setFormData] = useState<EditSourceFormData>(INITIAL_FORM_DATA);
  const initialIsActiveRef = useRef(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const { data: sourcesResponse, isLoading } = useDataSources({
    page,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const { data: sourceDetail, isLoading: isSourceLoading } = useDataSource(editingSourceId);

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
    const persistedDefaultDirectId =
      sourceDetail.directProviders?.find(({ isDefault }) => isDefault)?.provider.value ?? "";
    setFormData({
      isActive: sourceDetail.isActive,
      shortName: sourceDetail.name,
      longName: "",
      name: sourceDetail.name,
      description: sourceDetail.description ?? "",
      shortDescription: sourceDetail.description ?? "",
      longDescription: "",
      internalName: sourceDetail.internalName,
      pathDisplay: pathNameToDisplay(sourceDetail.pathName),
      referenceCost:
        sourceDetail.referenceCost == null ? "" : maskCurrency4(sourceDetail.referenceCost),
      contractCostsByProviderId: Object.fromEntries(
        (sourceDetail.directProviders ?? []).map(({ provider, contractCost }) => [
          provider.value,
          contractCost == null ? "" : maskCurrency4(contractCost),
        ]),
      ),
      defaultProviderId: persistedDefaultDirectId,
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
          name: formData.shortName,
          description: formData.shortDescription,
          internalName: formData.internalName,
          pathName: displayToPathName(formData.pathDisplay),
          referenceCost: formData.referenceCost
            ? toApiDecimalString4(unmaskCurrency4(formData.referenceCost))
            : null,
          providerContractCosts: (sourceDetail?.directProviders ?? []).map(({ provider }) => {
            const value = formData.contractCostsByProviderId[provider.value] ?? "";
            return {
              providerId: provider.value,
              contractCost: value ? toApiDecimalString4(unmaskCurrency4(value)) : null,
            };
          }),
          defaultProviderId: formData.defaultProviderId,
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
    sourceDetail?.directProviders,
    updateDataSource,
    patchDataSourceActive,
    resetDrawer,
  ]);

  const columns: ColumnConfig<DataSource & { actions?: never }>[] = [
    buildProviderIdColumn<DataSource & { actions?: never }>(),
    {
      id: "isActive",
      label: "Status",
      width: 72,
      render: (value) => (
        <Chip
          size="sm"
          variant="flat"
          color={value ? "success" : "danger"}
          className={
            value
              ? "h-7 rounded-full bg-[#17c964]/20 text-[#22c55e]"
              : "h-7 rounded-full bg-danger-50 text-danger-700"
          }
        >
          {value ? "Ativo" : "Inativo"}
        </Chip>
      ),
    },
    {
      id: "name",
      label: "Nome",
      render: (value, row) => (
        <Link
          to={providersSourceDetailPath(row.id)}
          className="text-primary hover:underline font-medium text-left"
        >
          {String(value)}
        </Link>
      ),
    },
    buildProviderInternalNameColumn<DataSource & { actions?: never }>(),
    buildProviderDescriptionColumn<DataSource & { actions?: never }>(),
    {
      id: "referenceCost",
      label: "Custo de referência (R$)",
      align: "end",
      render: (value) => (
        <span>{formatSourceCurrency(value as number | string | null | undefined)}</span>
      ),
    },
    {
      id: "averageRealCost",
      label: "Custo real médio (R$)",
      align: "end",
      render: (value) => (
        <span>{formatSourceCurrency(value as number | string | null | undefined)}</span>
      ),
    },
    {
      id: "actions",
      label: "Ações",
      align: "center",
      width: 100,
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            title="Ver vínculos"
            aria-label="Ver vínculos"
            onClick={() => setLinkedSource(row)}
            className="rounded-full p-2 text-primary transition-all hover:bg-primary-50 hover:text-primary-700"
          >
            <LinkIcon size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            title="Editar fonte"
            aria-label="Editar fonte"
            onClick={() => handleEditSource(row)}
            className="rounded-full p-2 text-primary transition-all hover:bg-primary-50 hover:text-primary-700"
          >
            <Pencil size={18} aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  const isFormReady = !isSourceLoading && Boolean(sourceDetail);
  const persistedDefaultDirectId =
    sourceDetail?.directProviders?.find(({ isDefault }) => isDefault)?.provider.value ?? "";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Input
        aria-label="Buscar fontes"
        placeholder="Pesquise por fonte"
        value={search}
        onValueChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        className="max-w-md"
        classNames={defaultInputClassNames}
        startContent={<Search className="text-gray-400" size={20} />}
      />
      <div className="relative">
        <DynamicTable
          columns={columns}
          data={sources}
          isLoading={isLoading}
          keyExtractor={(row) => row.id}
          emptyMessage="Nenhuma fonte encontrada"
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
        variant="providers"
      />

      <DataSourceLinkedTemplatesSidebar
        source={linkedSource}
        onClose={() => setLinkedSource(null)}
      />

      <DynamicDrawer
        size="2xl"
        title="Editar fonte"
        isOpen={isDrawerOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDrawer();
        }}
        classNames={{
          body: "flex-1! min-h-0 mb-0 overflow-y-auto",
          footer: "mt-auto",
        }}
        component={
          isSourceLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" color="primary" />
            </div>
          ) : isFormReady && sourceDetail ? (
            <EditSourceForm
              sourceId={editingSourceId ?? ""}
              formData={formData}
              persistedDefaultProviderId={persistedDefaultDirectId}
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
