"use client";

import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { Checkbox, Input, Radio, RadioGroup, Textarea } from "@heroui/react";
import { useState } from "react";
import type { PreviewConsultationType } from "../types/backgroundCheckTemplatePreview.types";

export type PreviewTemplateDetailsValues = {
  name: string;
  internalName: string;
  description: string;
  consultationType: PreviewConsultationType | "";
  isActive: boolean;
};

export const DEFAULT_PREVIEW_TEMPLATE_DETAILS: PreviewTemplateDetailsValues = {
  name: "",
  internalName: "",
  description: "",
  consultationType: "br-person",
  isActive: true,
};

const consultationTypes: Array<{ value: PreviewConsultationType; label: string }> = [
  { value: "br-person", label: "Pessoa Física" },
  { value: "br-entity", label: "Pessoa Jurídica" },
  { value: "intl-entity", label: "Pessoa estrangeira" },
];

export function isPreviewTemplateDetailsValid(value: PreviewTemplateDetailsValues) {
  return Boolean(
    value.name.trim() &&
      value.internalName.trim() &&
      value.description.trim() &&
      value.consultationType,
  );
}

export type BackgroundCheckTemplateDetailsStepProps = {
  initialValue?: Partial<PreviewTemplateDetailsValues>;
  onChange?: (value: PreviewTemplateDetailsValues) => void;
  onValidityChange?: (isValid: boolean) => void;
  showValidationErrors?: boolean;
};

export function BackgroundCheckTemplateDetailsStep({
  initialValue,
  onChange,
  onValidityChange,
  showValidationErrors = false,
}: BackgroundCheckTemplateDetailsStepProps) {
  const [value, setValue] = useState<PreviewTemplateDetailsValues>({
    ...DEFAULT_PREVIEW_TEMPLATE_DETAILS,
    ...initialValue,
  });

  const update = (partial: Partial<PreviewTemplateDetailsValues>) => {
    const nextValue = { ...value, ...partial };
    setValue(nextValue);
    onChange?.(nextValue);
    onValidityChange?.(isPreviewTemplateDetailsValid(nextValue));
  };

  const fieldLabelClassName = "text-sm text-zinc-600";
  const requiredMessage = (show: boolean) =>
    show ? <p className="text-sm text-danger-500">Campo obrigatório</p> : null;

  return (
    <div className="flex flex-col gap-6">
      <Checkbox
        isSelected={value.isActive}
        onValueChange={(isActive) => update({ isActive })}
        classNames={{ label: "text-sm font-medium text-default-700" }}
      >
        Ativo
      </Checkbox>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex min-w-0 flex-col gap-3">
          <span className={fieldLabelClassName}>Nome do modelo</span>
          <Input
            aria-label="Nome do modelo"
            placeholder="Digite o nome do modelo"
            value={value.name}
            onValueChange={(name) => update({ name })}
            isInvalid={showValidationErrors && !value.name.trim()}
            classNames={defaultInputClassNames}
          />
          {requiredMessage(showValidationErrors && !value.name.trim())}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <span className={fieldLabelClassName}>Nome interno</span>
          <Input
            aria-label="Nome interno"
            placeholder="Digite o nome interno"
            value={value.internalName}
            onValueChange={(internalName) => update({ internalName })}
            isInvalid={showValidationErrors && !value.internalName.trim()}
            classNames={defaultInputClassNames}
          />
          {requiredMessage(showValidationErrors && !value.internalName.trim())}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <span className={fieldLabelClassName}>Descrição do modelo</span>
          <Textarea
            aria-label="Descrição do modelo"
            placeholder="Digite a descrição do modelo"
            value={value.description}
            onValueChange={(description) => update({ description })}
            isInvalid={showValidationErrors && !value.description.trim()}
            classNames={defaultInputClassNames}
            minRows={3}
          />
          {requiredMessage(showValidationErrors && !value.description.trim())}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <span className={fieldLabelClassName}>Tipo de consulta</span>
          <RadioGroup
            aria-label="Tipo de consulta"
            value={value.consultationType}
            onValueChange={(consultationType) =>
              update({ consultationType: consultationType as PreviewConsultationType })
            }
            classNames={{ wrapper: "gap-3" }}
          >
            {consultationTypes.map((type) => (
              <Radio
                key={type.value}
                value={type.value}
                classNames={{ label: "text-sm text-default-700" }}
              >
                {type.label}
              </Radio>
            ))}
          </RadioGroup>
          {requiredMessage(showValidationErrors && !value.consultationType)}
        </div>
      </div>
    </div>
  );
}
