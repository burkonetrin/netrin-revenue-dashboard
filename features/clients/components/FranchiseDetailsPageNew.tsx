"use client";

import { PROTOTYPE_BASE_PATH } from "@/constants";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { PermissionGuard } from "@/shared/components/guards/PermissionGuard";
import { usePermission } from "@/shared/hooks/usePermission";
import { formatCurrency, formatCurrency4 } from "@/shared/utils/currency";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Spinner,
  Switch,
  Tab,
  Tabs,
  addToast,
} from "@heroui/react";
import { CLIENTS_PERMISSIONS } from "../constants/clientsPermissions.constants";
import { useBillingModels } from "../hooks/useBillingModels";
import { useClientById } from "../hooks/useClientById";
import { useDeductibleProfitCenter } from "../hooks/useDeductibleProfitCenter";
import { useGetDeductible } from "../hooks/useGetDeductible";
import { useUpdateDeductibleStatus } from "../hooks/useUpdateDeductibleStatus";
import {
  getPriceRangeUnitPriceLabel,
  includesBillingSection,
  isFixedPriceOnlyOption,
  resolveBillingModelOption,
} from "../utils/billingModel.utils";
import type { BillingModelOption } from "../types/deductibles.types";
import { formatTermDateLabel } from "../utils/franchiseTermBounds.utils";
import { FranchiseBackgroundCheckTemplatesTab } from "./FranchiseBackgroundCheckTemplatesTab";
import { FranchiseDeactivateConfirmModal } from "./FranchiseDeactivateConfirmModal";
import { FranchiseLinkedProductsTab } from "./FranchiseLinkedProductsTab";
import { FranchiseLinkedSourcesTab } from "./FranchiseLinkedSourcesTab";
import { FranchisePaymentInfoTab } from "./FranchisePaymentInfoTab";
import { FranchiseInfoCard, franchiseDetailsTabsClassNames } from "./franchiseDetails.shared";
import { getCurrentMonth } from "@/features/billing/utils/billing-list.utils";
import { formatBillingCompetence } from "@/features/billing/utils/billing.utils";

function openEditPlaceholder(step: string) {
  addToast({
    title: "Editar franquia",
    description: `Passo "${step}" — fluxo completo disponível no Nucleus; simulação de salvamento no protótipo.`,
    color: "primary",
    timeout: 4000,
  });
}

interface FranchiseDetailsPageNewProps {
  clientId: string;
  contractId: string;
  franchiseId: string;
}

type FranchiseDetailTabKey =
  | "sobre"
  | "informacoes-pagamento"
  | "financeiro"
  | "produtos"
  | "modelos-background-check"
  | "fontes-vinculadas";

function isBgcProduct(product: { id?: string; name?: string; internalName?: string }) {
  return [product.id, product.name, product.internalName].filter(Boolean).some((value) => {
    const normalized = String(value).toLowerCase();
    return (
      normalized.includes("bgc") ||
      normalized.includes("background check") ||
      normalized.includes("background-check") ||
      normalized.includes("background_check") ||
      normalized.includes("backgroundcheck")
    );
  });
}

/**
 * Página de detalhes da franquia (fluxo novo).
 */
export function FranchiseDetailsPageNew({
  clientId,
  contractId,
  franchiseId,
}: FranchiseDetailsPageNewProps) {
  const navigate = useNavigate();
  const { can } = usePermission();
  const { data: deductible, isLoading } = useGetDeductible(contractId, franchiseId);
  const { data: client } = useClientById(clientId);
  const { data: billingModels = [] } = useBillingModels();
  const billingModelOptions = billingModels as BillingModelOption[];
  const { data: deductibleProfitCenter, isLoading: isLoadingProfitCenter } =
    useDeductibleProfitCenter(clientId, contractId, franchiseId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateDeductibleStatus();

  const [selectedTab, setSelectedTab] = useState<FranchiseDetailTabKey>("sobre");
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const currentCompetenceLabel = useMemo(
    () => formatBillingCompetence(getCurrentMonth()),
    [],
  );

  const canEnterDetails = can(CLIENTS_PERMISSIONS.deductibleDetails);
  const canOverview = can(CLIENTS_PERMISSIONS.deductibleOverview);
  const canBillingModel = can(CLIENTS_PERMISSIONS.deductibleBillingModel);
  const canProducts = can(CLIENTS_PERMISSIONS.deductibleUpdateOverview);
  const canSources = can(CLIENTS_PERMISSIONS.deductibleSources);
  const canPaymentInfo = can(CLIENTS_PERMISSIONS.paymentInfo);
  const shouldShowPaymentInfo =
    canPaymentInfo && client?.nfeUnificationLevel?.value === "deductible" && !deductible?.isTest;

  useEffect(() => {
    if (!canEnterDetails) {
      navigate(`${PROTOTYPE_BASE_PATH}/clientes/${clientId}?tab=contratos`, { replace: true });
    }
  }, [canEnterDetails, clientId, navigate]);

  const hasBgcProduct = useMemo(
    () => (deductible?.products ?? []).some(isBgcProduct),
    [deductible?.products],
  );

  const visibleTabs = useMemo(() => {
    const tabs: FranchiseDetailTabKey[] = [];
    if (canOverview) tabs.push("sobre");
    if (shouldShowPaymentInfo) tabs.push("informacoes-pagamento");
    if (canBillingModel) tabs.push("financeiro");
    if (canProducts) tabs.push("produtos");
    if (hasBgcProduct && canSources) tabs.push("modelos-background-check");
    if (!hasBgcProduct && canSources) tabs.push("fontes-vinculadas");
    return tabs;
  }, [canOverview, shouldShowPaymentInfo, canBillingModel, canProducts, canSources, hasBgcProduct]);

  useEffect(() => {
    if (visibleTabs.length === 0) return;
    if (!visibleTabs.includes(selectedTab)) {
      setSelectedTab(visibleTabs[0]);
    }
  }, [visibleTabs, selectedTab]);

  if (!canEnterDetails) {
    return (
      <div className="size-full flex items-center justify-center p-12">
        <Spinner label="Redirecionando..." color="primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center p-12 text-default-500">
        Carregando detalhes da franquia...
      </div>
    );
  }

  if (!deductible) {
    return (
      <div className="size-full flex items-center justify-center p-12 text-danger">
        Franquia não encontrada.
      </div>
    );
  }

  const billingModelOption = resolveBillingModelOption(
    deductible.billingModel,
    billingModelOptions,
  );
  const showFixedPrice = includesBillingSection(billingModelOption, "fixedPrice");
  const showPriceRanges = includesBillingSection(billingModelOption, "priceRanges");
  const isFixedPriceOnly = isFixedPriceOnlyOption(billingModelOption);
  const showExcessPrice = isFixedPriceOnly && !deductible.automaticBlocking;
  const formatFranchisePrice = (value: number | string) => {
    return deductible.isTest ? formatCurrency(value) : formatCurrency4(value);
  };

  const confirmDeactivate = (competenceBilling: "keep" | "remove") => {
    updateStatus(
      {
        contractId,
        deductibleId: franchiseId,
        isActive: false,
        competenceBilling,
      },
      {
        onSettled: () => setIsDeactivateModalOpen(false),
      },
    );
  };

  return (
    <div className="size-full p-6">
      <Breadcrumbs className="mb-4 text-sm">
        <BreadcrumbItem>
          <Link to={`${PROTOTYPE_BASE_PATH}?tab=clientes`}>Clientes</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to={`${PROTOTYPE_BASE_PATH}/clientes/${clientId}?tab=contratos`}>
            Detalhes do cliente
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem>Detalhes da franquia</BreadcrumbItem>
      </Breadcrumbs>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-default-800">{deductible.name}</h2>
          <p className="text-sm text-default-500">{deductible.description}</p>
        </div>
      </div>

      {visibleTabs.length === 0 ? (
        <p className="text-sm text-default-500">
          Nenhuma aba disponível para as permissões deste usuário.
        </p>
      ) : (
        <Tabs
          aria-label="Deductible details tabs"
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as FranchiseDetailTabKey)}
          classNames={franchiseDetailsTabsClassNames}
        >
          {canOverview && (
            <Tab key="sobre" title="Sobre">
              <div className="mt-6 space-y-5">
                <div className="flex flex-col gap-4">
                  <PermissionGuard permission={CLIENTS_PERMISSIONS.deductibleUpdateOverview}>
                    <Button
                      color="primary"
                      className="px-6 w-fit"
                      radius="sm"
                      onPress={() => openEditPlaceholder("basic")}
                    >
                      Editar
                    </Button>
                  </PermissionGuard>

                  <PermissionGuard permission={CLIENTS_PERMISSIONS.deductibleUpdateOverview}>
                    <Switch
                      isSelected={deductible.isActive}
                      onValueChange={(nextActive) => {
                        if (nextActive) {
                          updateStatus({
                            contractId,
                            deductibleId: franchiseId,
                            isActive: true,
                          });
                          return;
                        }
                        setIsDeactivateModalOpen(true);
                      }}
                      isDisabled={isUpdating}
                      size="sm"
                      classNames={{
                        label: "text-sm text-default-500",
                      }}
                    >
                      {deductible.isActive ? "Ativo" : "Inativo"}
                    </Switch>
                  </PermissionGuard>
                  <FranchiseDeactivateConfirmModal
                    isOpen={isDeactivateModalOpen}
                    competenceLabel={currentCompetenceLabel}
                    isLoading={isUpdating}
                    onClose={() => setIsDeactivateModalOpen(false)}
                    onKeepInBilling={() => confirmDeactivate("keep")}
                    onRemoveFromBilling={() => confirmDeactivate("remove")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FranchiseInfoCard
                    label="Vigência"
                    value={`${formatTermDateLabel(deductible.beginningTerm)} - ${formatTermDateLabel(deductible.endTerm)}`}
                  />
                  <FranchiseInfoCard
                    label="Renovação Automática"
                    value={deductible.automaticRenovation ? "Sim" : "Não"}
                  />
                  <FranchiseInfoCard
                    label="Expiração do comprovante (dias)"
                    value={
                      deductible.proofExpiration !== null &&
                      deductible.proofExpiration !== undefined
                        ? String(deductible.proofExpiration)
                        : "-"
                    }
                  />
                  {deductible.isTest && (
                    <FranchiseInfoCard
                      label="Período da franquia"
                      value={
                        deductible.testPeriodMonths !== null &&
                        deductible.testPeriodMonths !== undefined
                          ? String(deductible.testPeriodMonths)
                          : "-"
                      }
                    />
                  )}
                  {!deductible.isTest && (
                    <>
                      <FranchiseInfoCard
                        label="Centro de lucro"
                        value={
                          isLoadingProfitCenter
                            ? "-"
                            : (deductibleProfitCenter?.profitCenter?.label ?? "-")
                        }
                      />
                      <FranchiseInfoCard
                        label="Centro de lucro (excedente)"
                        value={
                          isLoadingProfitCenter
                            ? "-"
                            : (deductibleProfitCenter?.overageProfitCenter?.label ?? "-")
                        }
                      />
                    </>
                  )}
                </div>
              </div>
            </Tab>
          )}

          {shouldShowPaymentInfo && (
            <Tab key="informacoes-pagamento" title="Informações de pagamento">
              <FranchisePaymentInfoTab
                clientId={clientId}
                contractId={contractId}
                franchiseId={franchiseId}
                onEdit={() => openEditPlaceholder("payment")}
              />
            </Tab>
          )}

          {canBillingModel && (
            <Tab key="financeiro" title="Modelo de cobrança">
              <div className="mt-6 space-y-5">
                <PermissionGuard permission={CLIENTS_PERMISSIONS.deductibleUpdateBillingModel}>
                  <Button
                    color="primary"
                    className="px-6"
                    radius="sm"
                    onPress={() => openEditPlaceholder("billing")}
                  >
                    Editar
                  </Button>
                </PermissionGuard>

                <FranchiseInfoCard
                  label="Modelo de Cobrança"
                  value={deductible.billingModel.label}
                />

                {isFixedPriceOnly && (
                  <FranchiseInfoCard
                    label="Bloqueio Automático"
                    value={deductible.automaticBlocking ? "Sim" : "Não"}
                  />
                )}

                {showFixedPrice && deductible.fixedPrice && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FranchiseInfoCard
                      label="Consultas Incluídas"
                      value={deductible.fixedPrice.includedConsultations.toString()}
                    />
                    <FranchiseInfoCard
                      label="Preço do Pacote"
                      value={formatFranchisePrice(deductible.fixedPrice.packagePrice)}
                    />
                  </div>
                )}

                {showExcessPrice && (
                  <FranchiseInfoCard
                    label="Preço Unitário Excedente"
                    value={
                      deductible.excessUnitPrice !== null &&
                      deductible.excessUnitPrice !== undefined
                        ? formatFranchisePrice(deductible.excessUnitPrice)
                        : "-"
                    }
                  />
                )}

                {showPriceRanges && deductible.priceRanges && deductible.priceRanges.length > 0 && (
                  <div className="border-t border-default-200 pt-5 space-y-3">
                    <h3 className="text-xl font-medium text-default-700">Faixas de valor</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {deductible.priceRanges.map((range) => (
                        <div key={range.id} className="grid grid-cols-3 gap-3">
                          <FranchiseInfoCard
                            label="Mínimo de consultas"
                            value={range.minConsultations?.toString() ?? "-"}
                          />
                          <FranchiseInfoCard
                            label="Máximo de consultas"
                            value={
                              range.maxConsultations !== null &&
                              range.maxConsultations !== undefined
                                ? range.maxConsultations.toString()
                                : "Sem limite"
                            }
                          />
                          <FranchiseInfoCard
                            label={getPriceRangeUnitPriceLabel(deductible.billingModel.value)}
                            value={formatFranchisePrice(range.unitPrice)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Tab>
          )}

          {canProducts && (
            <Tab key="produtos" title="Produtos da franquia">
              <FranchiseLinkedProductsTab
                products={deductible.products ?? []}
                onEdit={() => openEditPlaceholder("products")}
              />
            </Tab>
          )}

          {hasBgcProduct && canSources && (
            <Tab key="modelos-background-check" title="Modelos Background Check">
              <FranchiseBackgroundCheckTemplatesTab
                franchiseId={franchiseId}
                onEdit={() => openEditPlaceholder("templates")}
              />
            </Tab>
          )}

          {!hasBgcProduct && canSources && (
            <Tab key="fontes-vinculadas" title="Fontes vinculadas">
              <FranchiseLinkedSourcesTab
                franchiseId={franchiseId}
                onEdit={() => openEditPlaceholder("sources")}
              />
            </Tab>
          )}
        </Tabs>
      )}
    </div>
  );
}
