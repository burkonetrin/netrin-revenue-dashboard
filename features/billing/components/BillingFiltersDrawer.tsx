"use client";

import { useProfitCenters } from "@/features/clients/hooks/useProfitCenters";
import { formatProfitCenterOptions } from "@/features/clients/utils/paymentInfo.utils";
import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { defaultSelectClassNames } from "@/shared/styles/inputClassNames";
import { Button, Select, SelectItem, addToast } from "@heroui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BillingFilters } from "../types/billing.types";
import { BILLING_INVOICE_STATUS_FILTER_OPTIONS } from "../types/billing-invoice-status.types";
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

function resolveDefaultCompetenceMonth(value?: string) {
  return value || getCurrentMonth();
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
  const [localProfitCenterId, setLocalProfitCenterId] = useState(filters.profitCenterId);
  const [localInvoiceStatus, setLocalInvoiceStatus] = useState(filters.invoiceStatus);

  const { data: profitCenters = [], isLoading: isLoadingProfitCenters } =
    useProfitCenters(canListProfitCenters);

  const profitCenterOptions = useMemo(
    () => formatProfitCenterOptions(profitCenters),
    [profitCenters],
  );

  useEffect(() => {
    if (!isOpen) {
      drawerWasOpenRef.current = false;
      return;
    }

    if (drawerWasOpenRef.current) return;
    drawerWasOpenRef.current = true;

    setLocalStartMonth(resolveDefaultCompetenceMonth(filters.startMonth));
    setLocalEndMonth(resolveDefaultCompetenceMonth(filters.endMonth));
    setLocalProfitCenterId(filters.profitCenterId);
    setLocalInvoiceStatus(filters.invoiceStatus);
  }, [filters.startMonth, filters.endMonth, filters.profitCenterId, filters.invoiceStatus, isOpen]);

  const handleApply = () => {
    const nextFilters: BillingFilters = {
      startMonth: localStartMonth,
      endMonth: localEndMonth,
      profitCenterId: localProfitCenterId,
      clientId: filters.clientId,
      invoiceStatus: localInvoiceStatus,
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
    setLocalProfitCenterId(undefined);
    setLocalInvoiceStatus(undefined);
    onClear();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

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
        footer: "border-t-0 pb-0!",
      }}
      component={
        <div className="flex flex-col gap-8">
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

          {canListProfitCenters ? (
            <Select
              label="Centro de lucro"
              labelPlacement="outside"
              placeholder="Filtre por centro de lucro"
              selectionMode="single"
              selectedKeys={localProfitCenterId ? new Set([localProfitCenterId]) : new Set()}
              onSelectionChange={(keys) => {
                if (keys === "all" || keys.size === 0) {
                  setLocalProfitCenterId(undefined);
                  return;
                }

                setLocalProfitCenterId(Array.from(keys)[0] as string);
              }}
              isLoading={isLoadingProfitCenters}
              className="w-full"
              radius="sm"
              classNames={defaultSelectClassNames}
            >
              {profitCenterOptions.map((profitCenter) => (
                <SelectItem key={profitCenter.value}>{profitCenter.label}</SelectItem>
              ))}
            </Select>
          ) : null}

          <Select
            label="Status da fatura"
            labelPlacement="outside"
            placeholder="Todos os status"
            selectionMode="single"
            selectedKeys={localInvoiceStatus ? new Set([localInvoiceStatus]) : new Set()}
            onSelectionChange={(keys) => {
              if (keys === "all" || keys.size === 0) {
                setLocalInvoiceStatus(undefined);
                return;
              }
              setLocalInvoiceStatus(Array.from(keys)[0] as BillingFilters["invoiceStatus"]);
            }}
            className="w-full"
            radius="sm"
            classNames={defaultSelectClassNames}
          >
            {BILLING_INVOICE_STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value}>{option.label}</SelectItem>
            ))}
          </Select>
        </div>
      }
      footer={
        <div className="flex w-full gap-2.5">
          <Button
            variant="light"
            onPress={handleClose}
            className="h-10 flex-1 border border-gray-300"
          >
            Voltar
          </Button>
          <Button
            variant="light"
            onPress={handleClear}
            className="h-10 flex-1 border border-gray-300"
          >
            Limpar filtros
          </Button>
          <Button color="primary" onPress={handleApply} className="h-10 flex-1">
            Aplicar filtros
          </Button>
        </div>
      }
    />
  );
}
