"use client";

import { Input, Select, SelectItem } from "@heroui/react";
import {
  defaultInputClassNames,
  defaultSelectClassNames,
} from "@/shared/styles/inputClassNames";

/**
 * Opções de tipo de provedor para o formulário.
 */
export const PROVIDER_TYPES = {
  DIRECT: 1,
  INDIRECT: 2,
} as const;

// Provider type labels mapping
const providerTypeLabels: Record<number, string> = {
  1: "Direto (Fonte)",
  2: "Indireto",
};

/**
 * Dados do formulário de provedor.
 */
export interface ProviderFormData {
  name: string;
  description: string;
  type: number | "";
}

interface ProviderFormProps {
  formData: ProviderFormData;
  onFormDataChange: (data: ProviderFormData) => void;
}

/**
 * Formulário de criação de provedor.
 */
export function NewProviderForm({
  formData,
  onFormDataChange,
}: ProviderFormProps) {
  const handleNameChange = (value: string) => {
    onFormDataChange({ ...formData, name: value });
  };

  const handleDescriptionChange = (value: string) => {
    onFormDataChange({ ...formData, description: value });
  };

  const handleTypeChange = (keys: Set<string | number> | "all") => {
    const selectedKey = Array.from(keys)[0] as string;
    onFormDataChange({
      ...formData,
      type: selectedKey ? Number(selectedKey) : "",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Nome do fornecedor"
        labelPlacement="outside"
        placeholder="Digite um nome"
        radius="sm"
        value={formData.name}
        onValueChange={handleNameChange}
        classNames={defaultInputClassNames}
      />
      <Input
        label="Descrição do fornecedor"
        labelPlacement="outside"
        placeholder="Digite uma descrição"
        radius="sm"
        value={formData.description}
        onValueChange={handleDescriptionChange}
        classNames={defaultInputClassNames}
      />
      <Select
        label="Tipo"
        labelPlacement="outside"
        placeholder="Selecione o tipo"
        radius="sm"
        selectedKeys={formData.type !== "" ? [String(formData.type)] : []}
        onSelectionChange={handleTypeChange}
        classNames={defaultSelectClassNames}
      >
        <SelectItem key={String(PROVIDER_TYPES.DIRECT)}>
          {providerTypeLabels[PROVIDER_TYPES.DIRECT]}
        </SelectItem>
        <SelectItem key={String(PROVIDER_TYPES.INDIRECT)}>
          {providerTypeLabels[PROVIDER_TYPES.INDIRECT]}
        </SelectItem>
      </Select>
    </div>
  );
}
