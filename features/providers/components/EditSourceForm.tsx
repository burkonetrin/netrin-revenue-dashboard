"use client";

import { Input, Spinner, Switch, Textarea } from "@heroui/react";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import type { EditSourceFormData } from "../types/data-sources.types";
import type { Provider } from "../types/providers.types";

interface EditSourceFormProps {
  formData: EditSourceFormData;
  onFormDataChange: (data: EditSourceFormData) => void;
  providers: Provider[];
  isProvidersLoading: boolean;
}

/**
 * Formulário de edição de fonte de dados.
 */
export function EditSourceForm({
  formData,
  onFormDataChange,
  providers,
  isProvidersLoading,
}: EditSourceFormProps) {
  const update = (partial: Partial<EditSourceFormData>) => {
    onFormDataChange({ ...formData, ...partial });
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <Switch
        isSelected={formData.isActive}
        onValueChange={(isActive) => update({ isActive })}
        classNames={{ label: "text-sm font-medium" }}
      >
        Ativa
      </Switch>

      <Input
        label="Nome da fonte"
        labelPlacement="outside"
        placeholder="Digite o nome da fonte"
        value={formData.name}
        onValueChange={(name) => update({ name })}
        classNames={defaultInputClassNames}
      />

      <Input
        label="Nome interno"
        labelPlacement="outside"
        placeholder="Digite o nome interno"
        value={formData.internalName}
        onValueChange={(internalName) => update({ internalName })}
        classNames={defaultInputClassNames}
      />

      <Textarea
        label="Descrição"
        labelPlacement="outside"
        placeholder="Digite a descrição"
        value={formData.description}
        onValueChange={(description) => update({ description })}
        classNames={defaultInputClassNames}
        minRows={3}
      />

      <Input
        label="Custo padrão (R$)"
        labelPlacement="outside"
        placeholder="—"
        value=""
        isDisabled
        classNames={defaultInputClassNames}
      />

      <Input
        label="Path"
        labelPlacement="outside"
        placeholder='Ex: ["sintegra-ro"]'
        value={formData.pathDisplay}
        onValueChange={(pathDisplay) => update({ pathDisplay })}
        classNames={defaultInputClassNames}
      />

      <div className="flex flex-col gap-0 rounded-lg overflow-hidden border border-default-200">
        <div className="bg-default-100 px-4 py-3">
          <p className="text-sm font-semibold text-default-600">
            Fornecedores desta fonte
          </p>
        </div>
        <div className="bg-white">
          {isProvidersLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="sm" color="primary" />
            </div>
          ) : providers.length === 0 ? (
            <p className="px-4 py-6 text-sm text-default-400 text-center">
              Nenhum fornecedor vinculado a esta fonte
            </p>
          ) : (
            providers.map((provider, index) => (
              <div
                key={provider.id}
                className={`px-4 py-3 text-sm text-default-700 ${
                  index < providers.length - 1
                    ? "border-b border-default-100"
                    : ""
                }`}
              >
                {provider.name}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
