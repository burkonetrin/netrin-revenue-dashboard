import type {
  BackgroundCheckTemplate,
  BackgroundCheckTemplateDataSourceOption,
} from "@/features/background-check-templates";
import type {
  BackgroundCheckTemplatePreviewRow,
  PreviewConsultationType,
  PreviewTemplateBindingClient,
} from "../types/backgroundCheckTemplatePreview.types";

type CurrentTemplateRecord = BackgroundCheckTemplate & {
  internalName?: string;
  internal_name?: string;
};

export type PreviewDemoTemplateData = {
  defaultCost?: number | null;
  realCost?: number | null;
  bindings?: PreviewTemplateBindingClient[];
};

const EMPTY_BINDINGS: PreviewTemplateBindingClient[] = [];

function getConsultationType(template: CurrentTemplateRecord): PreviewConsultationType | null {
  const value =
    template.consultationType ??
    template.consultation_type ??
    template.queryType ??
    template.query_type;
  const normalized =
    typeof value === "object" && value !== null && "value" in value ? value.value : value;

  return normalized === "br-person" || normalized === "br-entity" || normalized === "intl-entity"
    ? normalized
    : null;
}

function getInternalName(template: CurrentTemplateRecord) {
  return template.internalName ?? template.internal_name ?? null;
}

function getSourceNames(dataSources: BackgroundCheckTemplateDataSourceOption[]) {
  return dataSources
    .map((source) => source.label)
    .filter((label): label is string => Boolean(label));
}

export function mapBackgroundCheckTemplatePreview(
  template: CurrentTemplateRecord,
  dataSources: BackgroundCheckTemplateDataSourceOption[] = [],
  demo: PreviewDemoTemplateData = {},
): BackgroundCheckTemplatePreviewRow {
  return {
    id: template.id,
    name: template.name,
    internalName: getInternalName(template),
    description: template.description ?? null,
    consultationType: getConsultationType(template),
    isActive: template.isActive ?? template.is_active ?? false,
    sourceNames: getSourceNames(dataSources),
    defaultCost: demo.defaultCost ?? null,
    realCost: demo.realCost ?? null,
    bindings: demo.bindings ?? EMPTY_BINDINGS,
    origins: {
      record: "api",
      sourceNames: dataSources.length > 0 ? "api" : "demo",
      costs: "demo",
      bindings: "demo",
    },
  };
}

export function filterBackgroundCheckTemplatePreviewRows(
  rows: BackgroundCheckTemplatePreviewRow[],
  search: string,
) {
  const query = search.trim().toLocaleLowerCase();
  if (!query) return rows;

  return rows.filter((row) =>
    [row.name, row.internalName, row.description, ...row.sourceNames]
      .filter(Boolean)
      .some((value) => String(value).toLocaleLowerCase().includes(query)),
  );
}
