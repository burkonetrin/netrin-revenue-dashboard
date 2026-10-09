"use client";

import {
  defaultInputClassNames,
  defaultSelectClassNames,
} from "@/shared/styles/inputClassNames";
import { Input, Select, SelectItem } from "@heroui/react";
import { CirclePlus } from "lucide-react";

/**
 * Opções de origem de serviço no formulário.
 */
export const SOURCE_OPTIONS = {
  PF_REGULARITY: "Pessoa Física / Regularidade do CPF",
  OTHER: "Outra Fonte",
} as const;

/**
 * Dados do formulário de serviço.
 */
export interface ServiceFormData {
  internalName: string;
  serviceName: string;
  costPerQuery: string;
  linkedSource: string;
}

interface ServiceFormProps {
  formServiceData: ServiceFormData;
  onFormServiceDataChange: (data: ServiceFormData) => void;
}

/**
 * Formulário de cadastro de serviço.
 */
export function ServiceForm({
  formServiceData,
  onFormServiceDataChange,
}: ServiceFormProps) {
  const handleInternalNameChange = (value: string) => {
    onFormServiceDataChange({ ...formServiceData, internalName: value });
  };

  const handleServiceNameChange = (value: string) => {
    onFormServiceDataChange({ ...formServiceData, serviceName: value });
  };

  const handleCostPerQueryChange = (value: string) => {
    onFormServiceDataChange({ ...formServiceData, serviceName: value });
  };

  const handleLinkedSourceChange = (keys: Set<string | number> | "all") => {
    const selectedKey = Array.from(keys)[0] as string;
    onFormServiceDataChange({
      ...formServiceData,
      linkedSource: selectedKey || "",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Nome interno"
        labelPlacement="outside"
        placeholder="Digite um nome"
        radius="sm"
        value={formServiceData.internalName}
        onValueChange={handleInternalNameChange}
        classNames={defaultInputClassNames}
      />
      <Input
        label="Nome do serviço"
        labelPlacement="outside"
        placeholder="Digite um nome"
        radius="sm"
        value={formServiceData.serviceName}
        onValueChange={handleServiceNameChange}
        classNames={defaultInputClassNames}
      />
      <Input
        label="Custo por consulta (R$)"
        labelPlacement="outside"
        placeholder="0,00"
        radius="sm"
        value={formServiceData.costPerQuery}
        onValueChange={handleCostPerQueryChange}
        classNames={defaultInputClassNames}
      />
      <Select
        label="Vincular fonte"
        labelPlacement="outside"
        placeholder="Selecione uma opção"
        radius="sm"
        selectedKeys={
          formServiceData.linkedSource ? [formServiceData.linkedSource] : []
        }
        onSelectionChange={handleLinkedSourceChange}
        classNames={defaultSelectClassNames}
      >
        <SelectItem key={SOURCE_OPTIONS.PF_REGULARITY}>
          {SOURCE_OPTIONS.PF_REGULARITY}
        </SelectItem>
        <SelectItem key={SOURCE_OPTIONS.OTHER}>
          {SOURCE_OPTIONS.OTHER}
        </SelectItem>
      </Select>
      <button
        type="button"
        onClick={() => {
          console.log("Link new source");
        }}
        className="text-primary hover:text-primary-700 transition-colors cursor-pointer text-left flex items-center gap-1"
      >
        <CirclePlus size={16} />
        Vincular nova fonte
      </button>
    </div>
  );
}
