import type { BackgroundCheckTemplate } from "@/features/background-check-templates";

export type PreviewConsultationType = "br-person" | "br-entity" | "intl-entity";
export type PreviewDataOrigin = "api" | "demo";

export type PreviewProviderOption = {
  id: string;
  name: string;
  defaultCost: number | null;
  realCost: number | null;
  origin: PreviewDataOrigin;
};

export type PreviewSourceOption = {
  id: string;
  name: string;
  internalName?: string;
  consultationTypes: PreviewConsultationType[];
  isActive: boolean;
  providers: PreviewProviderOption[];
  origin: PreviewDataOrigin;
  referenceCost?: number | null;
};

export type PreviewSourceSelection = {
  sourceId: string;
  providerId: string | null;
};

export type PreviewTemplateBindingUser = {
  id: string;
  name: string;
};

export type PreviewTemplateBindingFranchise = {
  id: string;
  name: string;
  users: PreviewTemplateBindingUser[];
};

export type PreviewTemplateBindingClient = {
  id: string;
  name: string;
  franchises: PreviewTemplateBindingFranchise[];
};

export type BackgroundCheckTemplatePreviewRow = {
  id: string;
  name: string;
  internalName: string | null;
  description: string | null;
  consultationType: PreviewConsultationType | null;
  isActive: boolean;
  sourceNames: string[];
  defaultCost: number | null;
  realCost: number | null;
  bindings: PreviewTemplateBindingClient[];
  origins: {
    record: "api";
    sourceNames: PreviewDataOrigin;
    costs: "demo";
    bindings: "demo";
  };
};

export type BackgroundCheckTemplatePreviewInput = Pick<
  BackgroundCheckTemplate,
  "id" | "name" | "description" | "commercialName" | "consultationType" | "isActive"
>;
