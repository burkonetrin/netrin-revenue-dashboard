"use client";

import { useProfitCenters } from "@/features/clients/hooks/useProfitCenters";
import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { Button, Checkbox, Spinner, addToast } from "@heroui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BillingFilters } from "../types/billing.types";
import {
  BILLING_INVOICE_STATUS_FILTER_OPTIONS,
  type BillingInvoiceStatusFilterKey,
} from "../types/billing-invoice-status.types";
import { getCurrentMonth } from "../utils/billing-list.utils";
import { isBillingMonthRangeValid } from "../utils/billing-month.utils";
import { BillingMonthSelect } from "./BillingMonthSelect";

interface BillingFiltersDrawerProps {
  isOpen: boolean;
  canListProfitCenters: boolean;
  filters: BillingFilters;
  onOpenChange: (isOpen: boolean) => void;
  onApply: (filters: BillingFilters) => void;
  onClear: () => void;
}

const STATUS_FILTER_COLUMN_ONE = BILLING_INVOICE_STATUS_FILTER_OPTIONS.slice(0, 5);
const STATUS_FILTER_COLUMN_TWO = BILLING_INVOICE_STATUS_FILTER_OPTIONS.slice(5);

const filterSectionTitleClassName = "mb-3 text-sm font-normal text-zinc-600";
const filterSectionDividerClassName = "border-0 border-t border-default-200";

function resolveDefaultCompetenceMonth(value?: string) {
  return value || getCurrentMonth();
}

function resolveProfitCenterIds(filters: BillingFilters): string[] {
  if (filters.profitCenterIds?.length) {
    return filters.profitCenterIds;
  }
  if (filters.profitCenterId) {
    return [filters.profitCenterId];
  }
  return [];
}

function resolveInvoiceStatuses(filters: BillingFilters): BillingInvoiceStatusFilterKey[] {
  if (filters.invoiceStatuses?.length) {
    return filters.invoiceStatuses;
  }
  if (filters.invoiceStatus) {
    return [filters.invoiceStatus];
  }
  return [];
}

/**
 * Drawer de filtros da listagem de faturamento (período + centro de lucro).
 * O filtro por cliente fica na toolbar da listagem.
 */
export function BillingFiltersDrawer({
  isOpen,
  canListProfitCenters,
  filters,
  onOpenChange,
  onApply,
  onClear,
}: BillingFiltersDrawerProps) {
  const drawerWasOpenRef = useRef(false);

  const [localStartMonth, setLocalStartMonth] = useState(() =>
    resolveDefaultCompetenceMonth(filters.startMonth),
  );
  const [localEndMonth, setLocalEndMonth] = useState(() =>
    resolveDefaultCompetenceMonth(filters.endMonth),
  );
  const [localProfitCenterIds, setLocalProfitCenterIds] = useState<string[]>(() =>
    resolveProfitCenterIds(filters),
  );
  const [localInvoiceStatuses, setLocalInvoiceStatuses] = useState<BillingInvoiceStatusFilterKey[]>(() =>
    resolveInvoiceStatuses(filters),
  );

  const { data: profitCenters = [], isLoading: isLoadingProfitCenters } = useProfitCenters(
    canListProfitCenters,
    { useFinancialManagementMock: true },
  );

  const representativeGroups = useMemo(() => {
    const groups = new Map<
      string,
      { name: string; profitCenters: Array<{ id: string; label: string }> }
    >();

    for (const profitCenter of profitCenters) {
      if (profitCenter.isActive === false) continue;
      const name = profitCenter.representativeName;
      if (typeof name !== "string" || name.trim().length === 0) continue;
      const group = groups.get(name) ?? { name, profitCenters: [] };
      group.profitCenters.push({
        id: profitCenter.id,
        label: `${profitCenter.code} - ${profitCenter.name}`,
      });
      groups.set(name, group);
    }

    return Array.from(groups.values());
  }, [profitCenters]);

  useEffect(() => {
    if (!isOpen) {
      drawerWasOpenRef.current = false;
      return;
    }

    if (drawerWasOpenRef.current) return;
    drawerWasOpenRef.current = true;

    setLocalStartMonth(resolveDefaultCompetenceMonth(filters.startMonth));
    setLocalEndMonth(resolveDefaultCompetenceMonth(filters.endMonth));
    setLocalProfitCenterIds(resolveProfitCenterIds(filters));
    setLocalInvoiceStatuses(resolveInvoiceStatuses(filters));
  }, [
    filters.startMonth,
    filters.endMonth,
    filters.profitCenterId,
    filters.profitCenterIds,
    filters.invoiceStatus,
    filters.invoiceStatuses,
    isOpen,
  ]);

  const toggleInvoiceStatus = (status: BillingInvoiceStatusFilterKey, checked: boolean) => {
    setLocalInvoiceStatuses((current) => {
      if (checked) {
        if (current.includes(status)) return current;
        return [...current, status];
      }
      return current.filter((value) => value !== status);
    });
  };

  const handleApply = () => {
    const nextFilters: BillingFilters = {
      startMonth: localStartMonth,
      endMonth: localEndMonth,
      profitCenterIds: localProfitCenterIds,
      clientId: filters.clientId,
      invoiceStatuses: localInvoiceStatuses.length > 0 ? localInvoiceStatuses : undefined,
    };

    if (!isBillingMonthRangeValid(nextFilters)) {
      addToast({
        title: "Período inválido",
        description: "A competência inicial deve ser anterior ou igual à competência final.",
        color: "warning",
        timeout: 4000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    if ((localStartMonth && !localEndMonth) || (!localStartMonth && localEndMonth)) {
      addToast({
        title: "Período incompleto",
        description: "Selecione a competência inicial e a competência final.",
        color: "warning",
        timeout: 4000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    onApply(nextFilters);
  };

  const handleClear = () => {
    const currentMonth = getCurrentMonth();
    setLocalStartMonth(currentMonth);
    setLocalEndMonth(currentMonth);
    setLocalProfitCenterIds([]);
    setLocalInvoiceStatuses([]);
    onClear();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const renderStatusCheckbox = (option: (typeof BILLING_INVOICE_STATUS_FILTER_OPTIONS)[number]) => (
    <Checkbox
      key={option.value}
      isSelected={localInvoiceStatuses.includes(option.value)}
      onValueChange={(checked) => toggleInvoiceStatus(option.value, checked)}
      classNames={{ label: "text-sm text-slate-700" }}
    >
      {option.label}
    </Checkbox>
  );

  return (
    <DynamicDrawer
      size="lg"
      title="Filtros"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        base: "max-w-[504px]",
        header: "font-bold text-gray-950",
        body: "flex-1! mb-0",
        footer: "border-t-0",
      }}
      component={
        <div className="flex flex-col">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BillingMonthSelect
              label="Competência inicial"
              value={localStartMonth}
              onChange={(value) => setLocalStartMonth(resolveDefaultCompetenceMonth(value))}
            />
            <BillingMonthSelect
              label="Competência final"
              value={localEndMonth}
              onChange={(value) => setLocalEndMonth(resolveDefaultCompetenceMonth(value))}
            />
          </div>

          <hr className={`${filterSectionDividerClassName} my-6`} aria-hidden />

          {canListProfitCenters ? (
            <>
              <fieldset className="border-0 p-0">
                <h3 className={filterSectionTitleClassName}>Centros de lucro</h3>
                {isLoadingProfitCenters ? (
                  <Spinner size="sm" color="primary" aria-label="Carregando centros de lucro" />
                ) : (
                  <div className="flex flex-col gap-2">
                    {representativeGroups.map((representative) => {
                      const selectedIds = representative.profitCenters
                        .filter(({ id }) => localProfitCenterIds.includes(id))
                        .map(({ id }) => id);
                      const isSelected = selectedIds.length > 0;

                      return (
                        <div key={representative.name}>
                          <Checkbox
                            isSelected={isSelected}
                            onValueChange={(checked) => {
                              setLocalProfitCenterIds((current) => {
                                const groupIds = representative.profitCenters.map(({ id }) => id);
                                const withoutGroup = current.filter((id) => !groupIds.includes(id));
                                return checked ? [...withoutGroup, ...groupIds] : withoutGroup;
                              });
                            }}
                            classNames={{ label: "text-sm text-slate-700" }}
                          >
                            {representative.name}
                          </Checkbox>
                          {isSelected ? (
                            <div className="ml-6 mt-2 flex flex-col gap-2.5 border-l border-default-200 pl-3">
                              {representative.profitCenters.map((profitCenter) => (
                                <Checkbox
                                  key={profitCenter.id}
                                  isSelected={localProfitCenterIds.includes(profitCenter.id)}
                                  onValueChange={(checked) => {
                                    setLocalProfitCenterIds((current) =>
                                      checked
                                        ? [...current, profitCenter.id]
                                        : current.filter((id) => id !== profitCenter.id),
                                    );
                                  }}
                                  classNames={{ label: "text-sm text-slate-700" }}
                                >
                                  {profitCenter.label}
                                </Checkbox>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </fieldset>

              <hr className={`${filterSectionDividerClassName} my-6`} aria-hidden />
            </>
          ) : null}

          <fieldset className="border-0 p-0">
            <h3 className={filterSectionTitleClassName}>Status da fatura</h3>
            <div className="grid grid-cols-2 gap-x-6">
              <div className="flex flex-col gap-2.5">
                {STATUS_FILTER_COLUMN_ONE.map(renderStatusCheckbox)}
              </div>
              <div className="flex flex-col gap-2.5">
                {STATUS_FILTER_COLUMN_TWO.map(renderStatusCheckbox)}
              </div>
            </div>
          </fieldset>
        </div>
      }
      footer={
        <div className="flex w-full justify-end gap-4">
          <Button
            variant="light"
            onPress={handleClose}
            className="h-10 rounded-lg border-2 border-default-300 bg-white px-4 text-sm font-normal leading-5"
          >
            Voltar
          </Button>
          <Button
            variant="light"
            onPress={handleClear}
            className="h-10 rounded-lg border-2 border-default-300 bg-white px-4 text-sm font-normal leading-5"
          >
            Limpar filtros
          </Button>
          <Button
            color="primary"
            onPress={handleApply}
            className="h-10 rounded-lg px-4 text-sm font-normal leading-5 text-white"
          >
            Aplicar filtros
          </Button>
        </div>
      }
    />
  );
}
