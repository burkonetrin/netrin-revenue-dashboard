"use client";

import { useListBackgroundCheckTemplates } from "@/features/background-check-templates";
import { BACKGROUND_CHECK_TEMPLATE_PERMISSIONS } from "@/features/background-check-templates/constants/backgroundCheckTemplatePermissions.constants";
import { useDataSources } from "@/features/providers/hooks/useDataSources";
import type { ProviderDetail } from "@/features/providers/types/providers.types";
import { usePermission } from "@/shared/hooks/usePermission";
import { useMemo, useState } from "react";
import { useBackgroundCheckTemplatePreviewProviders } from "../hooks/useBackgroundCheckTemplatePreviewProviders";
import type {
  PreviewConsultationType,
  PreviewSourceOption,
} from "../types/backgroundCheckTemplatePreview.types";
import { mapBackgroundCheckTemplatePreview } from "../utils/mapBackgroundCheckTemplatePreview";
import { parseReferenceCost } from "../utils/referenceCost";
import { BackgroundCheckTemplateBindingsSidebar } from "./BackgroundCheckTemplateBindingsSidebar";
import { BackgroundCheckTemplateDeletePreviewModal } from "./BackgroundCheckTemplateDeletePreviewModal";
import type { PreviewTemplateDetailsValues } from "./BackgroundCheckTemplateDetailsStep";
import { BackgroundCheckTemplatePreviewDrawer } from "./BackgroundCheckTemplatePreviewDrawer";
import { BackgroundCheckTemplatesPreviewTable } from "./BackgroundCheckTemplatesPreviewTable";

const PREVIEW_CONSULTATION_TYPES: PreviewConsultationType[] = [
  "br-person",
  "br-entity",
  "intl-entity",
];

function getSourceConsultationTypes(source: {
  consultationTypes?: Array<string | { value?: string }>;
}) {
  const types = (source.consultationTypes ?? [])
    .map((type) => (typeof type === "string" ? type : type.value))
    .filter((type): type is PreviewConsultationType =>
      PREVIEW_CONSULTATION_TYPES.includes(type as PreviewConsultationType),
    );

  return types.length > 0 ? types : PREVIEW_CONSULTATION_TYPES;
}

function parseProviderCost(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export function mapSourcesToPreviewOptions(
  sources: Array<{
    id: string;
    name: string;
    internalName?: string;
    consultationTypes?: Array<string | { value?: string }>;
    isActive: boolean;
    referenceCost?: unknown;
  }>,
  providerDetails: ProviderDetail[],
): PreviewSourceOption[] {
  const providersBySource = new Map<string, PreviewSourceOption["providers"]>();

  for (const provider of providerDetails) {
    if (provider.providerType.value !== "direct" || !("dataSources" in provider)) {
      continue;
    }

    for (const source of provider.dataSources) {
      const providers = providersBySource.get(source.id) ?? [];
      if (providers.some((item) => item.id === provider.id)) continue;

      providers.push({
        id: provider.id,
        name: provider.name,
        defaultCost: parseProviderCost(source.defaultCost),
        realCost: null,
        origin: "api",
      });
      providersBySource.set(source.id, providers);
    }
  }

  return sources.map((source) => ({
    id: source.id,
    name: source.name,
    internalName: source.internalName,
    consultationTypes: getSourceConsultationTypes(source),
    isActive: source.isActive,
    providers: providersBySource.get(source.id) ?? [],
    origin: "api",
    referenceCost: parseReferenceCost(source.referenceCost),
  }));
}

function getEditDetails(
  row: ReturnType<typeof mapBackgroundCheckTemplatePreview>,
): PreviewTemplateDetailsValues {
  return {
    name: row.name,
    internalName: row.internalName ?? "",
    description: row.description ?? "",
    consultationType: row.consultationType ?? "br-person",
    isActive: row.isActive,
  };
}

export function BackgroundCheckTemplatesPreview() {
  const { can } = usePermission();
  const {
    data: templatesResponse,
    isLoading: isLoadingTemplates,
    error: templatesError,
  } = useListBackgroundCheckTemplates({ page: 1, limit: 100 });
  const { data: sourcesResponse } = useDataSources({ page: 1, pageSize: 100 });
  const { data: providerDetails } = useBackgroundCheckTemplatePreviewProviders();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReturnType<
    typeof mapBackgroundCheckTemplatePreview
  > | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<ReturnType<
    typeof mapBackgroundCheckTemplatePreview
  > | null>(null);
  const [templateForBindings, setTemplateForBindings] = useState<ReturnType<
    typeof mapBackgroundCheckTemplatePreview
  > | null>(null);

  const rows = useMemo(
    () =>
      (templatesResponse?.data ?? []).map((template) =>
        mapBackgroundCheckTemplatePreview(template),
      ),
    [templatesResponse?.data],
  );
  const previewSources = useMemo(
    () => mapSourcesToPreviewOptions(sourcesResponse?.data ?? [], providerDetails),
    [providerDetails, sourcesResponse?.data],
  );
  const canAccess = can(BACKGROUND_CHECK_TEMPLATE_PERMISSIONS.access);
  const canCreate = can(BACKGROUND_CHECK_TEMPLATE_PERMISSIONS.create);
  const canUpdate = can(BACKGROUND_CHECK_TEMPLATE_PERMISSIONS.update);
  const canDelete = can(BACKGROUND_CHECK_TEMPLATE_PERMISSIONS.delete);

  const openCreate = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  const openEdit = (row: (typeof rows)[number]) => {
    setEditingTemplate(row);
    setIsFormOpen(true);
  };

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-default-900">Modelos Background Check</h1>
        <p className="mt-1 text-sm text-default-500">
          Gerencie os modelos disponíveis para consultas.
        </p>
      </div>

      {templatesError ? (
        <p className="text-sm text-danger">Não foi possível carregar os modelos.</p>
      ) : (
        <BackgroundCheckTemplatesPreviewTable
          rows={rows}
          isLoading={isLoadingTemplates}
          canCreate={canAccess && canCreate}
          canViewBindings={canAccess}
          canUpdate={canAccess && canUpdate}
          canDelete={canAccess && canDelete}
          onCreate={openCreate}
          onBindings={setTemplateForBindings}
          onEdit={openEdit}
          onDelete={setTemplateToDelete}
        />
      )}

      <BackgroundCheckTemplateDeletePreviewModal
        isOpen={Boolean(templateToDelete)}
        row={templateToDelete}
        onClose={() => setTemplateToDelete(null)}
      />
      <BackgroundCheckTemplateBindingsSidebar
        isOpen={Boolean(templateForBindings)}
        template={templateForBindings}
        onClose={() => setTemplateForBindings(null)}
      />
      <BackgroundCheckTemplatePreviewDrawer
        key={editingTemplate?.id ?? "new"}
        isOpen={isFormOpen}
        mode={editingTemplate ? "edit" : "create"}
        initialDetails={editingTemplate ? getEditDetails(editingTemplate) : undefined}
        sources={previewSources}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTemplate(null);
        }}
      />
    </main>
  );
}
