"use client";

import { Checkbox } from "@heroui/react";
import { isQsaEligibleDataSource } from "../utils/qsaBackgroundCheck.utils";

export const QSA_PARTNERS_BGC_CHECKBOX_LABEL = "Habilitar consulta de Background Check dos sócios";

export type TemplateDataSourceRowSource = {
  id: string;
  name: string;
  costLabel: string;
  internalName?: string;
};

type TemplateDataSourceRowProps = {
  source: TemplateDataSourceRowSource;
  isSelected: boolean;
  hasQsaBackgroundCheck: boolean;
  onSourceSelectedChange: (isSelected: boolean) => void;
  onHasQsaBackgroundCheckChange: (isChecked: boolean) => void;
};

/**
 * Linha de fonte do step 2 do modelo BGC, com checkbox QSA aninhado abaixo quando elegível.
 */
export function TemplateDataSourceRow({
  source,
  isSelected,
  hasQsaBackgroundCheck,
  onSourceSelectedChange,
  onHasQsaBackgroundCheckChange,
}: TemplateDataSourceRowProps) {
  const showPartnersCheckbox = isQsaEligibleDataSource(source) && isSelected;

  return (
    <div className="rounded-md border border-default-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <Checkbox
          isSelected={isSelected}
          onValueChange={onSourceSelectedChange}
          classNames={{
            base: "max-w-full flex-1 items-start",
            label: "text-base leading-6 text-default-800",
          }}
        >
          {source.name}
        </Checkbox>
        <p className="shrink-0 text-sm font-semibold text-gray-900">{source.costLabel}</p>
      </div>
      {showPartnersCheckbox ? (
        <div className="mt-3 pl-8">
          <Checkbox
            isSelected={hasQsaBackgroundCheck}
            onValueChange={onHasQsaBackgroundCheckChange}
            classNames={{
              label: "text-sm leading-5 text-default-700",
            }}
          >
            {QSA_PARTNERS_BGC_CHECKBOX_LABEL}
          </Checkbox>
        </div>
      ) : null}
    </div>
  );
}
