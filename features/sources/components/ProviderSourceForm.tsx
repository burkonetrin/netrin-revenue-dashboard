"use client";

/**
 * Formulário de providers vinculados a uma fonte de dados.
 */

import { useEffect } from "react";
import { Input, Button } from "@heroui/react";
import { Trash2, CirclePlus } from "lucide-react";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import type {
  ProviderSourceFormProps,
  Provider,
} from "@/features/sources/types/sources.types";

/**
 * Lista editável de providers associados à fonte de dados.
 */
export function ProviderSourceForm({
  formData,
  onFormDataChange,
}: ProviderSourceFormProps) {
  // Garante pelo menos 1 provider inicial
  // biome-ignore lint/correctness/useExhaustiveDependencies: só deve executar uma vez na montagem
  useEffect(() => {
    if (formData.providers.length === 0) {
      onFormDataChange({
        ...formData,
        providers: [
          {
            id: `provider-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            companyName: "",
            cnpj: "",
          },
        ],
      });
    }
  }, []);

  const handleProviderChange = (
    id: string,
    field: keyof Provider,
    value: string,
  ) => {
    const updatedProviders = formData.providers.map((provider) => {
      return provider.id === id ? { ...provider, [field]: value } : provider;
    });

    onFormDataChange({ ...formData, providers: updatedProviders });
  };

  const handleAddProvider = () => {
    const newProvider: Provider = {
      id: `provider-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      companyName: "",
      cnpj: "",
    };

    onFormDataChange({
      ...formData,
      providers: [...formData.providers, newProvider],
    });
  };

  const handleRemoveProvider = (id: string) => {
    const updatedProviders = formData.providers.filter(
      (provider) => provider.id !== id,
    );

    onFormDataChange({ ...formData, providers: updatedProviders });
  };

  // Filtrar providers que têm id (garantir type safety)
  const providersWithId = formData.providers.filter(
    (provider): provider is Provider & { id: string } => Boolean(provider.id),
  );

  return (
    <div className="flex flex-col gap-6">
      {providersWithId.map((provider, index) => (
        <div key={provider.id} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">
              Provider {index + 1}
            </h4>

            {providersWithId.length > 1 && (
              <Button
                isIconOnly
                size="sm"
                radius="sm"
                color="danger"
                variant="light"
                onPress={() => handleRemoveProvider(provider.id)}
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>

          <Input
            label="Nome da empresa"
            labelPlacement="outside"
            placeholder="Digite o nome da empresa"
            value={provider.companyName}
            onValueChange={(value) =>
              handleProviderChange(provider.id, "companyName", value)
            }
            classNames={defaultInputClassNames}
          />

          <Input
            label="CNPJ"
            labelPlacement="outside"
            placeholder="00.000.000/0000-00"
            value={provider.cnpj}
            onValueChange={(value) =>
              handleProviderChange(provider.id, "cnpj", value)
            }
            classNames={defaultInputClassNames}
          />
        </div>
      ))}

      <Button
        startContent={<CirclePlus size={20} />}
        radius="sm"
        color="primary"
        variant="light"
        onPress={handleAddProvider}
      >
        Adicionar novo provider
      </Button>
    </div>
  );
}
