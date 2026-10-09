"use client";

import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { DrawerFormFooter } from "@/shared/components/DynamicDrawer/DrawerFormFooter";
import { entityDetailTabsClassNames } from "@/shared/components/EntityDetailPageHeader";
import { type ErrorResponse, getErrorMessage } from "@/shared/utils/errorParser";
import { BreadcrumbItem, Breadcrumbs, Spinner, Tab, Tabs, addToast } from "@heroui/react";
import type { AxiosError } from "axios";
import { PROVIDERS_BASE_PATH } from "@/constants";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProvider } from "../hooks/useProvider";
import { useUpdateProvider } from "../hooks/useUpdateProvider";
import type { ProviderFormState } from "../types/providers.types";
import { mapFormToUpdateRequest, mapProviderDetailToFormState } from "../utils/providerForm.utils";
import { ProviderCostsTab } from "./ProviderCostsTab";
import { ProviderDetailsTab } from "./ProviderDetailsTab";
import { PROVIDER_FORM_ID, ProviderForm } from "./ProviderForm";
import { ProviderInvoicesTab } from "./ProviderInvoicesTab";

export interface ProviderDetailPageProps {
  providerId: string;
}

/**
 * Página de detalhes do fornecedor (DET-01..DET-10).
 * AD-005: sem guards RBAC granulares nesta entrega.
 */
export function ProviderDetailPage({ providerId }: ProviderDetailPageProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const { data: provider, isLoading, error, isError } = useProvider(providerId);
  const updateProvider = useUpdateProvider();

  const formInitialState = useMemo(() => {
    if (!provider) return undefined;
    return mapProviderDetailToFormState(provider);
  }, [provider]);

  const financialTabKey = provider?.isPrepaid ? "costs" : "invoices";
  const financialTabLabel = provider?.isPrepaid ? "Custos" : "Faturas";

  const handleCloseDrawer = useCallback(() => {
    setIsEditDrawerOpen(false);
  }, []);

  const handleSubmit = useCallback(
    async (form: ProviderFormState) => {
      try {
        await updateProvider.mutateAsync({
          id: providerId,
          data: mapFormToUpdateRequest(form),
        });
        addToast({
          title: "Fornecedor atualizado",
          description: "As alterações foram salvas com sucesso.",
          color: "success",
        });
        handleCloseDrawer();
      } catch (err) {
        const message = getErrorMessage((err as AxiosError<ErrorResponse>) ?? null);
        addToast({
          title: "Erro ao atualizar fornecedor",
          description: message || "Ocorreu um erro ao salvar o fornecedor.",
          color: "danger",
        });
      }
    },
    [providerId, updateProvider, handleCloseDrawer],
  );

  if (isLoading) {
    return (
      <div className="flex size-full items-center justify-center p-6">
        <Spinner label="Carregando fornecedor..." />
      </div>
    );
  }

  if (isError || !provider) {
    const status = (error as AxiosError | undefined)?.response?.status;
    const message =
      status === 404
        ? "Fornecedor não encontrado."
        : getErrorMessage((error as AxiosError<ErrorResponse> | null) ?? null) ||
          "Não foi possível carregar o fornecedor.";

    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-danger-500">{message}</p>
        <Link to={PROVIDERS_BASE_PATH} className="text-primary text-sm hover:underline">
          Voltar para Fontes e fornecedores
        </Link>
      </div>
    );
  }

  return (
    <div className="size-full space-y-4 p-6">
      <Breadcrumbs>
        <BreadcrumbItem>
          <Link to={PROVIDERS_BASE_PATH} className="text-zinc-500">
            Fontes e fornecedores
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem>{provider.name}</BreadcrumbItem>
      </Breadcrumbs>

      <Tabs
        aria-label="Abas do fornecedor"
        defaultSelectedKey={financialTabKey}
        classNames={{
          ...entityDetailTabsClassNames,
          panel: "pt-3 px-0 pb-0",
        }}
      >
        <Tab key={financialTabKey} title={financialTabLabel}>
          {provider.isPrepaid ? (
            <ProviderCostsTab providerId={providerId} provider={provider} />
          ) : (
            <ProviderInvoicesTab providerId={providerId} provider={provider} />
          )}
        </Tab>
        <Tab key="details" title="Detalhes">
          <ProviderDetailsTab provider={provider} onEdit={() => setIsEditDrawerOpen(true)} />
        </Tab>
      </Tabs>

      <DynamicDrawer
        size="lg"
        title="Editar fornecedor"
        isOpen={isEditDrawerOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDrawer();
        }}
        classNames={{
          body: "flex-1! mb-0",
          footer: "border-t-0",
        }}
        component={
          <ProviderForm
            key={providerId}
            mode="edit"
            initialState={formInitialState}
            onSubmit={handleSubmit}
          />
        }
        footer={
          <DrawerFormFooter
            variant="providers"
            formId={PROVIDER_FORM_ID}
            onCancel={handleCloseDrawer}
            isLoading={updateProvider.isPending}
            isCancelDisabled={updateProvider.isPending}
            saveLabel="Atualizar"
          />
        }
      />
    </div>
  );
}
