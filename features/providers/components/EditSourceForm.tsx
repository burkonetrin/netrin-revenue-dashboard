"use client";

import { Input, Radio, RadioGroup, Spinner, Switch, Textarea } from "@heroui/react";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { editCurrency4Mask, EMPTY_CURRENCY_PLACEHOLDER } from "@/shared/utils/currency";
import { getProviderById } from "../services/providers.service";
import type { EditSourceFormData } from "../types/data-sources.types";
import type { GetDirectProviderResponse, Provider, ProviderUsageInfo } from "../types/providers.types";
import {
  getIndirectUsagesForSource,
} from "../utils/editSourceForm.utils";
import { providerNativeTableHeadCellClass } from "../utils/providersTableColumns.shared";
import { providerDetailQueryKey } from "../utils/providersQueryInvalidation";

interface EditSourceFormProps {
  sourceId: string;
  formData: EditSourceFormData;
  persistedDefaultProviderId: string;
  onFormDataChange: (data: EditSourceFormData) => void;
  providers: Provider[];
  isProvidersLoading: boolean;
}

function FormSectionTitle({ children }: { children: string }) {
  return <h3 className="text-base font-medium text-default-600">{children}</h3>;
}

function FieldLabel({ children }: { children: string }) {
  return <p className="text-sm text-zinc-500">{children}</p>;
}

function DefaultBadge({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }
  return (
    <span
      aria-label="Fornecedor padrão"
      className="whitespace-nowrap rounded-full bg-default-200 px-2 py-1 text-xs"
    >
      Padrão
    </span>
  );
}

function IndirectProvidersCard({
  emptyMessage,
  providers,
}: {
  emptyMessage: string;
  providers: ProviderUsageInfo[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-default-200 bg-white">
      {providers.length === 0 ? (
        <p className="px-4 py-3 text-sm text-default-400">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-default-200">
          {providers.map((provider) => (
            <li key={provider.id} className="px-4 py-3 text-sm text-default-700">
              {provider.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Formulário de edição de fonte de dados.
 */
export function EditSourceForm({
  sourceId,
  formData,
  persistedDefaultProviderId,
  onFormDataChange,
  providers,
  isProvidersLoading,
}: EditSourceFormProps) {
  const directProviders = providers.filter(
    (provider) => provider.providerType.value === "direct",
  );
  const directProviderIds = directProviders.map((provider) => provider.id);

  const directDetailQueries = useQueries({
    queries: directProviderIds.map((providerId) => ({
      queryKey: providerDetailQueryKey(providerId),
      queryFn: () => getProviderById(providerId),
      enabled: Boolean(sourceId) && directProviderIds.length > 0,
    })),
  });

  const directDetailsById = useMemo(() => {
    const map = new Map<string, GetDirectProviderResponse>();
    for (let index = 0; index < directProviderIds.length; index += 1) {
      const providerId = directProviderIds[index];
      const queryResult = directDetailQueries[index]?.data;
      if (queryResult && "dataSources" in queryResult) {
        map.set(providerId, queryResult as GetDirectProviderResponse);
      }
    }
    return map;
  }, [directDetailQueries, directProviderIds]);

  const isDirectDetailsLoading = directDetailQueries.some((query) => query.isLoading);

  const selectedDirectDetail = directDetailsById.get(formData.defaultProviderId);

  const captchaProviders = getIndirectUsagesForSource(
    selectedDirectDetail,
    sourceId,
    "indirect_captcha",
  );
  const proxyProviders = getIndirectUsagesForSource(
    selectedDirectDetail,
    sourceId,
    "indirect_proxy",
  );

  const update = (partial: Partial<EditSourceFormData>) => {
    onFormDataChange({ ...formData, ...partial });
  };

  const handleDefaultDirectChange = (defaultProviderId: string) => {
    update({ defaultProviderId });
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

      <FormSectionTitle>Dados básicos</FormSectionTitle>

      <div className="flex flex-col gap-2">
        <label htmlFor="edit-source-short-name" className="text-sm text-zinc-500">
          Nome curto
        </label>
        <Input
          id="edit-source-short-name"
          placeholder="Digite o nome curto"
          value={formData.shortName}
          onValueChange={(shortName) => update({ shortName })}
          classNames={defaultInputClassNames}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="edit-source-long-name" className="text-sm text-zinc-500">
          Nome longo
        </label>
        <Input
          id="edit-source-long-name"
          placeholder="Digite o nome longo"
          value={formData.longName}
          onValueChange={(longName) => update({ longName })}
          classNames={defaultInputClassNames}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="edit-source-internal-name" className="text-sm text-zinc-500">
          Nome interno
        </label>
        <Input
          id="edit-source-internal-name"
          placeholder="Digite o nome interno"
          value={formData.internalName}
          onValueChange={(internalName) => update({ internalName })}
          classNames={defaultInputClassNames}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="edit-source-short-description" className="text-sm text-zinc-500">
          Descrição curta
        </label>
        <Textarea
          id="edit-source-short-description"
          placeholder="Digite a descrição curta"
          value={formData.shortDescription}
          onValueChange={(shortDescription) => update({ shortDescription })}
          classNames={defaultInputClassNames}
          minRows={3}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="edit-source-long-description" className="text-sm text-zinc-500">
          Descrição longa
        </label>
        <Textarea
          id="edit-source-long-description"
          placeholder="Digite a descrição longa"
          value={formData.longDescription}
          onValueChange={(longDescription) => update({ longDescription })}
          classNames={defaultInputClassNames}
          minRows={3}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="edit-source-path" className="text-sm text-zinc-500">
          Path
        </label>
        <Input
          id="edit-source-path"
          placeholder='Ex: ["sintegra-ro"]'
          value={formData.pathDisplay}
          onValueChange={(pathDisplay) => update({ pathDisplay })}
          classNames={defaultInputClassNames}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="edit-source-reference-cost" className="text-sm text-zinc-500">
          Custo de referência
        </label>
        <Input
          id="edit-source-reference-cost"
          placeholder={EMPTY_CURRENCY_PLACEHOLDER}
          value={formData.referenceCost}
          onValueChange={(referenceCost) =>
            update({ referenceCost: editCurrency4Mask(formData.referenceCost, referenceCost) })
          }
          classNames={defaultInputClassNames}
        />
      </div>

      <div className="flex flex-col">
        <div className="border-t border-default-200" />
        <div className="mt-4 flex flex-col gap-2">
          <FormSectionTitle>Fornecedores</FormSectionTitle>
          <div className="overflow-x-auto">
          <RadioGroup
            aria-label="Fornecedor padrão"
            value={formData.defaultProviderId}
            onValueChange={handleDefaultDirectChange}
            className="gap-0"
          >
            <table className="w-full table-fixed border-collapse text-sm">
              <colgroup>
                <col className="w-[45%]" />
                <col className="w-[25%]" />
                <col className="w-[30%]" />
              </colgroup>
              <thead>
                <tr className="text-left">
                  <th className={`whitespace-nowrap rounded-s-lg ${providerNativeTableHeadCellClass}`}>
                    Fornecedores da fonte
                  </th>
                  <th className={`whitespace-nowrap ${providerNativeTableHeadCellClass}`}>
                    Custo real (R$)
                  </th>
                  <th className={`whitespace-nowrap rounded-e-lg ${providerNativeTableHeadCellClass}`}>
                    Custo de contrato (R$)
                  </th>
                </tr>
              </thead>
              <tbody>
                {isProvidersLoading || isDirectDetailsLoading ? (
                  <tr>
                    <td colSpan={3} className="py-8">
                      <div className="flex justify-center">
                        <Spinner size="sm" color="primary" />
                      </div>
                    </td>
                  </tr>
                ) : directProviders.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-sm text-default-400">
                      Nenhum fornecedor vinculado a esta fonte
                    </td>
                  </tr>
                ) : (
                  directProviders.map((provider, index) => {
                    const providerId = provider.id;
                    const contractCost = formData.contractCostsByProviderId[providerId] ?? "";
                    const isLastRow = index === directProviders.length - 1;

                    return (
                      <tr
                        key={providerId}
                        className={`text-sm text-default-700 ${
                          isLastRow ? "" : "border-b border-default-100"
                        }`}
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <Radio
                              value={providerId}
                              aria-label={`Selecionar ${provider.name} como fornecedor padrão`}
                              classNames={{ label: "text-sm text-default-700" }}
                            >
                              {provider.name}
                            </Radio>
                            <DefaultBadge show={persistedDefaultProviderId === providerId} />
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-default-700">0,1000</td>
                        <td className="px-3 py-2">
                          <Input
                            aria-label={`Custo de contrato ${provider.name}`}
                            placeholder={EMPTY_CURRENCY_PLACEHOLDER}
                            value={contractCost}
                            onValueChange={(value) =>
                              update({
                                contractCostsByProviderId: {
                                  ...formData.contractCostsByProviderId,
                                  [providerId]: editCurrency4Mask(contractCost, value),
                                },
                              })
                            }
                            classNames={defaultInputClassNames}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </RadioGroup>
        </div>
        </div>

        <div className="mt-4 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <FieldLabel>Fornecedores de captcha</FieldLabel>
            <IndirectProvidersCard
              emptyMessage="Nenhum fornecedor de captcha vinculado ao fornecedor direto selecionado"
              providers={captchaProviders}
            />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel>Fornecedores de proxy</FieldLabel>
            <IndirectProvidersCard
              emptyMessage="Nenhum fornecedor de proxy vinculado ao fornecedor direto selecionado"
              providers={proxyProviders}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
