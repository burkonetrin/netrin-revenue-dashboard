"use client";

import { defaultInputClassNames, defaultSelectClassNames } from "@/shared/styles/inputClassNames";
import { Checkbox, Input, Select, SelectItem, type SharedSelection } from "@heroui/react";
import type { ProviderFormState, ProviderType } from "../types/providers.types";

export type ProviderFormBasicFieldsChange = Partial<
  Pick<ProviderFormState, "name" | "isPrepaid" | "providerType">
>;

export interface ProviderFormBasicFieldsProps {
  name: string;
  isPrepaid: boolean;
  providerType: ProviderType | "";
  mode: "create" | "edit";
  onChange: (patch: ProviderFormBasicFieldsChange) => void;
  errors?: Partial<Pick<Record<"name" | "providerType", string>, "name" | "providerType">>;
}

/**
 * Campos base do formulário de fornecedor (Figma `3529:107461` / anexo).
 * Nome do fornecedor → checkbox pré-pago → Select Tipo do fornecedor.
 */
export function ProviderFormBasicFields({
  name,
  isPrepaid,
  providerType,
  mode,
  onChange,
  errors,
}: ProviderFormBasicFieldsProps) {
  const isEdit = mode === "edit";

  const handleTypeChange = (keys: SharedSelection) => {
    if (keys === "all") return;
    const [selectedKey] = Array.from(keys);
    if (selectedKey === undefined) {
      onChange({ providerType: "" });
      return;
    }
    onChange({ providerType: String(selectedKey) as ProviderType });
  };

  return (
    <div className="flex flex-col gap-6">
      <Input
        label="Nome do fornecedor"
        labelPlacement="outside"
        placeholder="Digite um nome"
        radius="sm"
        value={name}
        onValueChange={(value) => onChange({ name: value })}
        isInvalid={Boolean(errors?.name)}
        errorMessage={errors?.name}
        classNames={defaultInputClassNames}
      />

      <Checkbox
        isSelected={isPrepaid}
        isDisabled={isEdit}
        onValueChange={(checked) => onChange({ isPrepaid: checked })}
        classNames={{
          base: "max-w-fit",
          label: "text-sm text-default-700",
        }}
      >
        Fornecedor pré-pago
      </Checkbox>

      <Select
        label="Tipo do fornecedor"
        labelPlacement="outside"
        placeholder="Selecione uma opção"
        radius="sm"
        selectedKeys={providerType ? [providerType] : []}
        isDisabled={isEdit}
        isInvalid={Boolean(errors?.providerType)}
        errorMessage={errors?.providerType}
        onSelectionChange={handleTypeChange}
        classNames={defaultSelectClassNames}
      >
        <SelectItem key="direct">Direto</SelectItem>
        <SelectItem key="indirect">Indireto</SelectItem>
      </Select>
    </div>
  );
}
