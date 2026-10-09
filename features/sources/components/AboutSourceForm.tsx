"use client";

/**
 * Campos básicos do formulário de fonte de dados (aba Sobre).
 */

import { Input, Switch } from "@heroui/react";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import type { AboutSourceFormProps } from "@/features/sources/types/sources.types";

/**
 * Formulário da aba Sobre com dados gerais da fonte de dados.
 */
export function AboutSourceForm({
  formData,
  onFormDataChange,
}: AboutSourceFormProps) {
  const handleStatusChange = (value: boolean) => {
    onFormDataChange({ ...formData, status: value });
  };

  const handleNameChange = (value: string) => {
    onFormDataChange({ ...formData, name: value });
  };

  const handleDescriptionChange = (value: string) => {
    onFormDataChange({ ...formData, description: value });
  };

  const handleInternalNameChange = (value: string) => {
    onFormDataChange({ ...formData, internalName: value });
  };

  const handleCreditValueChange = (value: string) => {
    onFormDataChange({ ...formData, creditValue: value });
  };

  const handleMongoIdChange = (value: string) => {
    onFormDataChange({ ...formData, mongoId: value });
  };

  const handlePathChange = (value: string) => {
    onFormDataChange({ ...formData, path: value });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Switch Ativa */}
      <Switch
        isSelected={formData.status}
        onValueChange={handleStatusChange}
        classNames={{
          label: "text-sm font-medium",
        }}
      >
        Ativa
      </Switch>

      {/* Nome da fonte de dados */}
      <Input
        label="Nome da fonte de dados"
        labelPlacement="outside"
        placeholder="Digite o nome da fonte"
        value={formData.name}
        onValueChange={handleNameChange}
        classNames={defaultInputClassNames}
      />

      {/* Descrição */}
      <Input
        label="Descrição"
        labelPlacement="outside"
        placeholder="Digite a descrição"
        value={formData.description}
        onValueChange={handleDescriptionChange}
        classNames={defaultInputClassNames}
      />

      {/* Nome interno */}
      <Input
        label="Nome interno"
        labelPlacement="outside"
        placeholder="Digite o nome interno"
        value={formData.internalName}
        onValueChange={handleInternalNameChange}
        classNames={defaultInputClassNames}
      />

      {/* Valor de crédito */}
      <Input
        label="Valor de crédito"
        labelPlacement="outside"
        placeholder="Digite o valor de crédito"
        value={formData.creditValue}
        onValueChange={handleCreditValueChange}
        classNames={defaultInputClassNames}
        type="number"
        step="0.1"
      />

      {/* Mongo ID */}
      <Input
        label="Mongo ID"
        labelPlacement="outside"
        placeholder="Digite o Mongo ID"
        value={formData.mongoId || ""}
        onValueChange={handleMongoIdChange}
        classNames={defaultInputClassNames}
      />

      {/* Path */}
      <Input
        label="Path* (em andamento)"
        labelPlacement="outside"
        placeholder="Digite o path"
        value={formData.path || ""}
        onValueChange={handlePathChange}
        classNames={defaultInputClassNames}
      />
    </div>
  );
}
