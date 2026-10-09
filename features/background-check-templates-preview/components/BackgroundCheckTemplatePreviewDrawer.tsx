"use client";

import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { Button } from "@heroui/react";
import { useState } from "react";
import type {
  PreviewSourceOption,
  PreviewSourceSelection,
} from "../types/backgroundCheckTemplatePreview.types";
import {
  BackgroundCheckTemplateDetailsStep,
  DEFAULT_PREVIEW_TEMPLATE_DETAILS,
  type PreviewTemplateDetailsValues,
  isPreviewTemplateDetailsValid,
} from "./BackgroundCheckTemplateDetailsStep";
import { BackgroundCheckTemplateSourcesSelection } from "./BackgroundCheckTemplateSourcesSelection";
import { BackgroundCheckTemplateSummary } from "./BackgroundCheckTemplateSummary";

export type BackgroundCheckTemplatePreviewSavePayload = {
  details: PreviewTemplateDetailsValues;
  selections: PreviewSourceSelection[];
};

export type BackgroundCheckTemplatePreviewDrawerProps = {
  isOpen: boolean;
  mode?: "create" | "edit";
  initialDetails?: Partial<PreviewTemplateDetailsValues>;
  initialSelections?: PreviewSourceSelection[];
  sources: PreviewSourceOption[];
  onClose: () => void;
  onSavePreview?: (payload: BackgroundCheckTemplatePreviewSavePayload) => void | Promise<void>;
};

export function BackgroundCheckTemplatePreviewDrawer({
  isOpen,
  mode = "create",
  initialDetails,
  initialSelections = [],
  sources,
  onClose,
  onSavePreview,
}: BackgroundCheckTemplatePreviewDrawerProps) {
  const initialFormValue: PreviewTemplateDetailsValues = {
    ...DEFAULT_PREVIEW_TEMPLATE_DETAILS,
    ...initialDetails,
  };
  const [step, setStep] = useState<1 | 2>(1);
  const [details, setDetails] = useState(initialFormValue);
  const [selections, setSelections] = useState(initialSelections);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);

  const resetAndClose = () => {
    setStep(1);
    setDetails(initialFormValue);
    setSelections(initialSelections);
    setShowValidationErrors(false);
    setSaveNotice(false);
    onClose();
  };

  const continueToSources = () => {
    if (!isPreviewTemplateDetailsValid(details)) {
      setShowValidationErrors(true);
      return;
    }
    setShowValidationErrors(false);
    setStep(2);
  };

  const savePreview = async () => {
    await onSavePreview?.({ details, selections });
    setSaveNotice(true);
  };

  const component =
    step === 1 ? (
      <BackgroundCheckTemplateDetailsStep
        initialValue={details}
        onChange={setDetails}
        showValidationErrors={showValidationErrors}
      />
    ) : (
      <div className="grid min-h-0 gap-6 lg:grid-cols-2 items-start">
        <BackgroundCheckTemplateSourcesSelection
          sources={sources}
          consultationType={details.consultationType}
          selections={selections}
          onSelectionsChange={setSelections}
        />
        <BackgroundCheckTemplateSummary sources={sources} selections={selections} />
        {saveNotice && (
          <output className="text-sm text-default-500 lg:col-span-2">
            Prévia salva localmente. Nenhuma associação foi persistida sem a BE 14607.
          </output>
        )}
      </div>
    );

  const footer = (
    <div className="flex w-full items-center justify-end gap-3">
      {step === 1 ? (
        <>
          <Button variant="light" className="border border-default-300" onPress={resetAndClose}>
            Cancelar
          </Button>
          <Button color="primary" onPress={continueToSources}>
            Salvar e prosseguir
          </Button>
        </>
      ) : (
        <>
          <Button variant="light" className="border border-default-300" onPress={() => setStep(1)}>
            Voltar
          </Button>
          <Button color="primary" onPress={() => void savePreview()}>
            Salvar modelo
          </Button>
        </>
      )}
    </div>
  );

  return (
    <DynamicDrawer
      size={step === 1 ? "2xl" : "5xl"}
      title={
        step === 1 ? (mode === "edit" ? "Editar modelo" : "Novo modelo") : "Fontes disponíveis"
      }
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) resetAndClose();
      }}
      component={component}
      footer={footer}
      classNames={{ body: "flex-1! mb-0 min-h-0 overflow-y-auto" }}
    />
  );
}
