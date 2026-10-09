"use client";

import {
  type BackgroundCheckTemplate,
  useAssignBackgroundCheckTemplateDataSources,
  useBackgroundCheckTemplateDataSources,
  useCreateBackgroundCheckTemplate,
  useDeleteBackgroundCheckTemplate,
  useListBackgroundCheckTemplates,
  useUpdateBackgroundCheckTemplate,
} from "@/features/background-check-templates";
import { BACKGROUND_CHECK_TEMPLATE_PERMISSIONS } from "@/features/background-check-templates/constants/backgroundCheckTemplatePermissions.constants";
import {
  buildAssignTemplateDataSourcesPayload,
  findEligibleQsaSource,
  getTemplateHasQsaBackgroundCheck,
  hydrateQsaBackgroundCheckFromLinkedSources,
  resolveQsaBackgroundCheckForSelection,
} from "@/features/background-check-templates/utils/qsaBackgroundCheck.utils";
import { formatReferenceCostDisplay } from "@/features/background-check-templates-preview/utils/referenceCost";
import { canListProductBackgroundCheckTemplates } from "@/features/products/constants/productsPermissions.constants";
import { SourceGroupSourcesStep } from "@/features/providers/components/SourceGroupSourcesStep";
import { useDataSources } from "@/features/providers/hooks/useDataSources";
import type { SourceGroupFormSource } from "@/features/providers/types/data-source-bundles.types";
import {
  buildProviderDescriptionColumn,
  buildProviderNameColumn,
  buildProviderStatusColumn,
  providerDrawerFooterClass,
  providerDrawerPrimaryButtonClass,
  providerDrawerSecondaryButtonClass,
  providerTableClassNames,
} from "@/features/providers/utils/providersTableColumns.shared";
import { toSourceGroupFormSourceFromDataSource } from "@/features/providers/utils/sourceGroupFormSource.utils";
import { formatCurrency } from "@/shared/utils/currency";
import { DeleteConfirmModal } from "@/shared/components/DeleteConfirmModal";
import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { usePermission } from "@/shared/hooks/usePermission";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import {
  Button,
  Input,
  Pagination,
  Radio,
  RadioGroup,
  Spinner,
  Textarea,
  Tooltip,
} from "@heroui/react";
import { CirclePlus, Info, Link, Pencil, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBackgroundCheckTemplateLinkedClients } from "../hooks/useBackgroundCheckTemplateLinkedClients";
import { TemplateLinkedClientsSidebar } from "./TemplateLinkedClientsSidebar";

const fieldLabelClassName = "text-sm text-zinc-500";
const radioClassNames = {
  control: "group-data-[selected=true]:bg-sky-500",
  label: "text-sm text-gray-700",
  wrapper: "group-data-[selected=true]:border-sky-500 group-data-[selected=true]:before:bg-sky-500",
};

function getTemplateQueryType(template: BackgroundCheckTemplate) {
  const value =
    template.consultationType ??
    template.consultation_type ??
    template.queryType ??
    template.query_type;

  if (value && typeof value === "object" && "value" in value) return value.value;
  return value ?? "-";
}

function getTemplateQueryTypeLabel(template: BackgroundCheckTemplate) {
  const value = template.consultationType ?? template.consultation_type;

  if (value && typeof value === "object" && "label" in value) return value.label;
  return getTemplateQueryType(template);
}

function getTemplateSourceCount(template: BackgroundCheckTemplate) {
  const linked = template.linkedDataSources ?? [];
  if (linked.length > 0) return linked.length;
  return template.sources ?? template.sourcesCount ?? template.sources_count ?? 0;
}

function getTemplateIsActive(template: BackgroundCheckTemplate) {
  return template.isActive ?? template.is_active ?? true;
}

function getTemplateCommercialUse(template: BackgroundCheckTemplate) {
  return (
    template.commercialName ??
    template.commercial_name ??
    template.commercialUse ??
    template.commercial_use ??
    "-"
  );
}

function getDataSourceId(source: unknown) {
  if (!source || typeof source !== "object") return null;

  const record = source as {
    id?: unknown;
    value?: unknown;
    dataSourceId?: unknown;
    data_source_id?: unknown;
    dataSource?: { id?: unknown };
    data_source?: { id?: unknown };
  };
  const id =
    record.id ??
    record.value ??
    record.dataSourceId ??
    record.data_source_id ??
    record.dataSource?.id ??
    record.data_source?.id;

  return typeof id === "string" && id.trim() ? id : null;
}

function dataSourceHasConsultationType(
  source: { consultationTypes?: Array<string | { value?: string }> },
  value: string,
) {
  return source.consultationTypes?.some((type) => {
    if (typeof type === "string") return type === value;
    return type.value === value;
  });
}

interface TemplateLinkButtonProps {
  template: BackgroundCheckTemplate;
  onOpen: (template: BackgroundCheckTemplate) => void;
}

function TemplateLinkButton({ template, onOpen }: TemplateLinkButtonProps) {
  const { data, isLoading } = useBackgroundCheckTemplateLinkedClients(template.id);
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
      <Tooltip content="Este modelo não possui vínculo com nenhum cliente" placement="top" showArrow>
        <span className="inline-flex">
          <button
            type="button"
            disabled
            aria-disabled
            aria-label="Modelo sem clientes vinculados"
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
      onClick={() => onOpen(template)}
      aria-label="Ver clientes vinculados"
      className="text-primary hover:text-primary-700 p-1 rounded-full hover:bg-primary-50 transition-all cursor-pointer"
    >
      <Link size={18} />
    </button>
  );
}

/** Stable legacy model management, relocated from the Background Check product tab. */
export function BackgroundCheckTemplatesManagementTab() {
  const { can } = usePermission();
  const canListTemplates = canListProductBackgroundCheckTemplates(can);
  const canCreateTemplate = can(BACKGROUND_CHECK_TEMPLATE_PERMISSIONS.create);
  const canUpdateTemplate = can(BACKGROUND_CHECK_TEMPLATE_PERMISSIONS.update);
  const canDeleteTemplate = can(BACKGROUND_CHECK_TEMPLATE_PERMISSIONS.delete);
  const canCreateCompleteTemplate = canCreateTemplate && canUpdateTemplate;
  const [isModelDrawerOpen, setIsModelDrawerOpen] = useState(false);
  const [modelDrawerStep, setModelDrawerStep] = useState<1 | 2>(1);
  const [createdTemplateId, setCreatedTemplateId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<BackgroundCheckTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<BackgroundCheckTemplate | null>(null);
  const [linkedClientsTemplate, setLinkedClientsTemplate] =
    useState<BackgroundCheckTemplate | null>(null);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templatesPage, setTemplatesPage] = useState(1);
  const [modelName, setModelName] = useState("");
  const [modelDescription, setModelDescription] = useState("");
  const [modelCommercialUse, setModelCommercialUse] = useState("");
  const [modelQueryType, setModelQueryType] = useState("br-person");
  const [dataSourcesQueryType, setDataSourcesQueryType] = useState("br-person");
  const [selectedSources, setSelectedSources] = useState<SourceGroupFormSource[]>([]);
  const [showSourceError, setShowSourceError] = useState(false);
  const [hasQsaBackgroundCheck, setHasQsaBackgroundCheck] = useState(false);
  const hydratedTemplateSourcesRef = useRef<string | null>(null);
  const { data: templatesResponse, isLoading: isLoadingTemplates } =
    useListBackgroundCheckTemplates(
      {
        page: templatesPage,
        pageSize: 10,
        search: templateSearch.trim() || null,
        sortBy: "name",
        sortDirection: "asc",
      },
      { enabled: canListTemplates },
    );
  const createTemplate = useCreateBackgroundCheckTemplate();
  const updateTemplate = useUpdateBackgroundCheckTemplate();
  const deleteTemplate = useDeleteBackgroundCheckTemplate();
  const assignTemplateDataSources = useAssignBackgroundCheckTemplateDataSources();
  const { data: linkedTemplateDataSources, isLoading: isLoadingLinkedTemplateDataSources } =
    useBackgroundCheckTemplateDataSources(createdTemplateId, {
      enabled:
        isModelDrawerOpen && modelDrawerStep === 2 && Boolean(editingTemplate) && canUpdateTemplate,
    });
  const { data: dataSourcesResponse } = useDataSources(
    {
      page: 1,
      pageSize: 100,
      sortBy: "createdAt",
      sortDirection: "desc",
      consultationType: dataSourcesQueryType,
    },
    { enabled: isModelDrawerOpen && modelDrawerStep === 2 && canUpdateTemplate },
  );

  const openModelDrawer = useCallback(
    (template?: BackgroundCheckTemplate) => {
      if (template ? !canUpdateTemplate : !canCreateCompleteTemplate) return;
      hydratedTemplateSourcesRef.current = null;
      if (template) {
        const queryType = getTemplateQueryType(template);
        setEditingTemplate(template);
        setCreatedTemplateId(template.id);
        setModelName(template.name ?? "");
        setModelDescription(template.description ?? "");
        setModelCommercialUse(
          getTemplateCommercialUse(template) === "-" ? "" : getTemplateCommercialUse(template),
        );
        setModelQueryType(queryType === "-" ? "br-person" : queryType);
        setDataSourcesQueryType(queryType === "-" ? "br-person" : queryType);
        setHasQsaBackgroundCheck(getTemplateHasQsaBackgroundCheck(template));
      } else {
        setEditingTemplate(null);
        setCreatedTemplateId(null);
        setModelName("");
        setModelDescription("");
        setModelCommercialUse("");
        setModelQueryType("br-person");
        setDataSourcesQueryType("br-person");
        setHasQsaBackgroundCheck(false);
      }
      setSelectedSources([]);
      setShowSourceError(false);
      setModelDrawerStep(1);
      setIsModelDrawerOpen(true);
    },
    [canCreateCompleteTemplate, canUpdateTemplate],
  );

  const handleViewLinkedClients = useCallback((template: BackgroundCheckTemplate) => {
    setLinkedClientsTemplate(template);
  }, []);

  const tableColumns = useMemo<ColumnConfig<BackgroundCheckTemplate>[]>(
    () => [
      {
        ...buildProviderStatusColumn<BackgroundCheckTemplate>(),
        align: "start",
        width: 80,
        render: (_, row) => {
          const statusColumn = buildProviderStatusColumn<BackgroundCheckTemplate>();
          return statusColumn.render?.(getTemplateIsActive(row), row);
        },
      },
      {
        ...buildProviderNameColumn<BackgroundCheckTemplate>(),
        align: "start",
        width: 200,
      },
      {
        ...buildProviderDescriptionColumn<BackgroundCheckTemplate>(),
        align: "start",
        width: 220,
      },
      {
        id: "queryType",
        label: "Tipo de consulta",
        align: "start",
        width: 160,
        render: (_, row) => <span>{getTemplateQueryTypeLabel(row)}</span>,
      },
      {
        id: "referenceCost",
        label: "Custo de referência (R$)",
        align: "start",
        width: 110,
        render: (_, row) => (
          <span>{formatReferenceCostDisplay(row.referenceCost ?? null)}</span>
        ),
      },
      {
        id: "actualCost",
        label: "Custo real (R$)",
        align: "start",
        width: 110,
        render: (_, row) => (
          <span>{row.actualCost == null ? "—" : formatCurrency(row.actualCost)}</span>
        ),
      },
      {
        id: "sources",
        label: "Fontes",
        align: "start",
        width: 80,
        render: (_, row) => {
          const sources = row.linkedDataSources ?? [];
          const count = getTemplateSourceCount(row);
          return (
            <div className="flex items-center gap-1">
              <span>{count}</span>
              {sources.length > 0 && (
                <Tooltip
                  content={
                    <ul>
                      {sources.map((source) => (
                        <li key={source.id}>
                          {source.name}
                          {source.isActive === false ? " (Inativa)" : ""}
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
            {canListTemplates ? (
              <TemplateLinkButton template={row} onOpen={handleViewLinkedClients} />
            ) : null}
            {canUpdateTemplate ? (
              <button
                type="button"
                onClick={() => openModelDrawer(row)}
                className="text-primary hover:text-primary-700 p-1 rounded-full hover:bg-primary-50 transition-all cursor-pointer"
                aria-label="Editar modelo"
              >
                <Pencil size={18} />
              </button>
            ) : null}
            {canDeleteTemplate ? (
              <button
                type="button"
                onClick={() => setTemplateToDelete(row)}
                className="text-danger hover:text-danger-600 p-1 rounded-full hover:bg-danger-50 transition-all cursor-pointer"
                aria-label="Excluir modelo"
              >
                <Trash2 size={18} />
              </button>
            ) : null}
          </div>
        ),
      },
    ],
    [canDeleteTemplate, canListTemplates, canUpdateTemplate, handleViewLinkedClients, openModelDrawer],
  );

  useEffect(() => {
    if (!editingTemplate || modelDrawerStep !== 2 || !linkedTemplateDataSources) return;
    if (hydratedTemplateSourcesRef.current === editingTemplate.id) return;

    hydratedTemplateSourcesRef.current = editingTemplate.id;
    const catalog = dataSourcesResponse?.data ?? [];
    setSelectedSources(
      linkedTemplateDataSources
        .map((linked) => {
          const id = getDataSourceId(linked);
          if (!id) return null;
          const meta = catalog.find((item) => item.id === id);
          if (meta) return toSourceGroupFormSourceFromDataSource(meta);
          const name =
            linked && typeof linked === "object" && "name" in linked
              ? String((linked as { name?: unknown }).name ?? id)
              : id;
          return {
            id,
            name,
            referenceCost: 0,
            realCost: 0,
          } satisfies SourceGroupFormSource;
        })
        .filter((source): source is SourceGroupFormSource => Boolean(source)),
    );
    setHasQsaBackgroundCheck(
      getTemplateHasQsaBackgroundCheck(editingTemplate) ||
        hydrateQsaBackgroundCheckFromLinkedSources(linkedTemplateDataSources),
    );
  }, [editingTemplate, linkedTemplateDataSources, modelDrawerStep, dataSourcesResponse?.data]);

  useEffect(() => {
    if (selectedSources.length > 0) {
      setShowSourceError(false);
    }
  }, [selectedSources.length]);

  const templates = canListTemplates ? (templatesResponse?.data ?? []) : [];
  const templatesPagination = templatesResponse?.pagination;
  const dataSources = canUpdateTemplate ? (dataSourcesResponse?.data ?? []) : [];
  const dataSourcesByConsultationType = dataSources.filter((source) =>
    dataSourceHasConsultationType(source, dataSourcesQueryType),
  );

  const resetModelDrawer = () => {
    setIsModelDrawerOpen(false);
    setModelDrawerStep(1);
    setCreatedTemplateId(null);
    setEditingTemplate(null);
    setModelName("");
    setModelDescription("");
    setModelCommercialUse("");
    setModelQueryType("br-person");
    setDataSourcesQueryType("br-person");
    setSelectedSources([]);
    setShowSourceError(false);
    setHasQsaBackgroundCheck(false);
    hydratedTemplateSourcesRef.current = null;
  };

  const eligibleQsaSource = findEligibleQsaSource(dataSourcesByConsultationType);

  const handleSelectedSourcesChange = useCallback(
    (sources: SourceGroupFormSource[]) => {
      setSelectedSources(sources);
      if (eligibleQsaSource && !sources.some((source) => source.id === eligibleQsaSource.id)) {
        setHasQsaBackgroundCheck(false);
      }
    },
    [eligibleQsaSource],
  );

  const handleCreateTemplate = () => {
    if (!canCreateCompleteTemplate) return;
    const consultationType = modelQueryType as "br-person" | "br-entity" | "intl-entity";
    setDataSourcesQueryType(consultationType);
    setSelectedSources([]);
    createTemplate.mutate(
      {
        name: modelName,
        description: modelDescription,
        commercialName: modelCommercialUse,
        consultationType,
        isActive: true,
      },
      {
        onSuccess: (created) => {
          setCreatedTemplateId(created.id);
          setModelDrawerStep(2);
        },
      },
    );
  };

  const handleSaveTemplateDetails = () => {
    if (!editingTemplate) {
      handleCreateTemplate();
      return;
    }
    if (!canUpdateTemplate) return;
    const consultationType = modelQueryType as "br-person" | "br-entity" | "intl-entity";
    setDataSourcesQueryType(consultationType);
    setSelectedSources([]);
    updateTemplate.mutate(
      {
        id: editingTemplate.id,
        data: {
          name: modelName,
          description: modelDescription,
          commercialName: modelCommercialUse.trim() || modelName.trim(),
          consultationType,
          hasQsaBackgroundCheck,
        },
      },
      {
        onSuccess: () => {
          setCreatedTemplateId(editingTemplate.id);
          setModelDrawerStep(2);
        },
      },
    );
  };

  const handleSaveTemplateDataSources = () => {
    if (!canUpdateTemplate) return;
    if (selectedSources.length === 0) {
      setShowSourceError(true);
      return;
    }
    const dataSourceIds = selectedSources.map((source) => source.id);
    if (!createdTemplateId) return;
    const qsaFlag = resolveQsaBackgroundCheckForSelection(
      Boolean(eligibleQsaSource && dataSourceIds.includes(eligibleQsaSource.id)),
      hasQsaBackgroundCheck,
    );
    const consultationType = modelQueryType as "br-person" | "br-entity" | "intl-entity";
    assignTemplateDataSources.mutate(
      { templateId: createdTemplateId, ...buildAssignTemplateDataSourcesPayload(dataSourceIds) },
      {
        onSuccess: () => {
          updateTemplate.mutate(
            {
              id: createdTemplateId,
              data: {
                name: modelName,
                description: modelDescription,
                commercialName: modelCommercialUse.trim() || modelName.trim(),
                consultationType,
                hasQsaBackgroundCheck: qsaFlag,
              },
            },
            {
              onSuccess: (updated) => {
                setEditingTemplate(updated);
                setHasQsaBackgroundCheck(getTemplateHasQsaBackgroundCheck(updated) || qsaFlag);
                resetModelDrawer();
              },
            },
          );
        },
      },
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          aria-label="Pesquisar modelos"
          value={templateSearch}
          onValueChange={(value) => {
            setTemplateSearch(value);
            setTemplatesPage(1);
          }}
          placeholder="Pesquise por modelo ou fonte"
          className="w-full max-w-[300px]"
          classNames={defaultInputClassNames}
          startContent={<Search className="text-gray-400" size={20} />}
        />
        {canCreateCompleteTemplate ? (
          <Button
            color="primary"
            radius="sm"
            startContent={<CirclePlus size={18} className="shrink-0" />}
            onPress={() => openModelDrawer()}
            className="shrink-0"
          >
            Novo modelo
          </Button>
        ) : null}
      </div>

      <DynamicTable
        columns={tableColumns}
        data={templates}
        isLoading={isLoadingTemplates}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhum modelo encontrado"
        classNames={providerTableClassNames}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-default-100">
        <p className="text-sm text-default-500">
          Mostrando <span className="font-semibold text-default-700">{templates.length}</span> de{" "}
          <span className="font-semibold text-default-700">
            {templatesPagination?.totalRecords ?? templates.length}
          </span>{" "}
          modelos
        </p>
        {templatesPagination && templatesPagination.totalPages > 1 ? (
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={templatesPage}
            total={templatesPagination.totalPages}
            onChange={setTemplatesPage}
            className="font-sans"
          />
        ) : null}
      </div>

      <DynamicDrawer
        size="xl"
        title={editingTemplate ? "Editar modelo de relatório" : "Novo modelo de relatório"}
        isOpen={isModelDrawerOpen}
        onOpenChange={(open) => {
          if (!open) resetModelDrawer();
          else setIsModelDrawerOpen(true);
        }}
        classNames={{
          body: "flex-1! mb-0",
          footer: "border-t-0",
        }}
        component={
          <div className="flex min-h-[520px] flex-col font-sans">
            <div className="flex-1 space-y-5 overflow-y-auto px-1 pr-4">
              {modelDrawerStep === 1 ? (
                <>
                  <div className="mb-8 flex flex-col gap-1">
                    <h2 className="text-2xl font-semibold tracking-tight text-default-900">
                      Informações básicas
                    </h2>
                  </div>
                  <div className="flex flex-col gap-5">
                    <Input
                      label="Nome do modelo"
                      labelPlacement="outside"
                      placeholder="Ex.: Relatório de pessoa física simples"
                      value={modelName}
                      onValueChange={setModelName}
                      classNames={defaultInputClassNames}
                    />
                    <Textarea
                      label="Descrição"
                      labelPlacement="outside"
                      placeholder="Ex.: Fontes essenciais para validação inicial de CPF"
                      value={modelDescription}
                      onValueChange={setModelDescription}
                      classNames={defaultInputClassNames}
                      minRows={3}
                    />
                    <Input
                      label="Nome comercial"
                      labelPlacement="outside"
                      placeholder="Ex.: BGC PF Simples"
                      value={modelCommercialUse}
                      onValueChange={setModelCommercialUse}
                      classNames={defaultInputClassNames}
                    />
                  </div>
                  <RadioGroup
                    label="Tipo da consulta"
                    value={modelQueryType}
                    onValueChange={(value) => {
                      setModelQueryType(value);
                      setDataSourcesQueryType(value);
                      setSelectedSources([]);
                      setHasQsaBackgroundCheck(false);
                    }}
                    classNames={{ label: fieldLabelClassName, wrapper: "gap-2" }}
                  >
                    <Radio value="br-person" classNames={radioClassNames}>
                      Pessoa física (CPF)
                    </Radio>
                    <Radio value="br-entity" classNames={radioClassNames}>
                      Pessoa jurídica (CNPJ)
                    </Radio>
                    <Radio value="intl-entity" classNames={radioClassNames}>
                      Pessoa estrangeira
                    </Radio>
                  </RadioGroup>
                </>
              ) : editingTemplate && isLoadingLinkedTemplateDataSources ? (
                <div className="flex justify-center py-16">
                  <Spinner size="lg" color="primary" />
                </div>
              ) : (
                <SourceGroupSourcesStep
                  entityLabel="modelo"
                  consultationType={dataSourcesQueryType}
                  selectedSources={selectedSources}
                  onSelectedSourcesChange={handleSelectedSourcesChange}
                  showSourceError={showSourceError}
                />
              )}
            </div>
          </div>
        }
        footer={
          <div className={`${providerDrawerFooterClass} font-sans`}>
            {modelDrawerStep === 2 && (
              <Button
                variant="light"
                className={providerDrawerSecondaryButtonClass}
                onPress={() => setModelDrawerStep(1)}
                isDisabled={
                  createTemplate.isPending ||
                  updateTemplate.isPending ||
                  assignTemplateDataSources.isPending
                }
              >
                Voltar
              </Button>
            )}
            {modelDrawerStep === 1 && (
              <Button
                variant="light"
                className={providerDrawerSecondaryButtonClass}
                onPress={resetModelDrawer}
                isDisabled={
                  createTemplate.isPending ||
                  updateTemplate.isPending ||
                  assignTemplateDataSources.isPending
                }
              >
                Cancelar
              </Button>
            )}
            <Button
              color="primary"
              className={providerDrawerPrimaryButtonClass}
              isLoading={
                createTemplate.isPending ||
                updateTemplate.isPending ||
                assignTemplateDataSources.isPending
              }
              isDisabled={modelDrawerStep === 1 && !modelName.trim()}
              onPress={() => {
                if (modelDrawerStep === 1) {
                  if (editingTemplate) handleSaveTemplateDetails();
                  else if (createdTemplateId) {
                    setDataSourcesQueryType(modelQueryType);
                    setModelDrawerStep(2);
                  } else handleSaveTemplateDetails();
                  return;
                }
                handleSaveTemplateDataSources();
              }}
            >
              {modelDrawerStep === 1 ? "Salvar e prosseguir" : "Salvar modelo"}
            </Button>
          </div>
        }
      />
      <DynamicDrawer
        size="md"
        title={linkedClientsTemplate?.name ?? "Clientes vinculados"}
        isOpen={Boolean(linkedClientsTemplate)}
        onOpenChange={(open) => {
          if (!open) setLinkedClientsTemplate(null);
        }}
        component={
          <TemplateLinkedClientsSidebar
            key={linkedClientsTemplate?.id ?? "closed"}
            template={linkedClientsTemplate}
          />
        }
      />

      <DeleteConfirmModal<BackgroundCheckTemplate>
        isOpen={Boolean(templateToDelete)}
        onClose={() => setTemplateToDelete(null)}
        record={templateToDelete}
        getRecordLabel={(template) => template.name}
        entityLabel="modelo"
        confirmLabel="Remover modelo"
        onConfirm={async (template) => {
          if (!canDeleteTemplate) return;
          await deleteTemplate.mutateAsync(template.id);
        }}
        showSuccessToast={false}
      />
    </div>
  );
}
