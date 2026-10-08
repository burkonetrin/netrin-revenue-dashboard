"use client";

import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { Input, addToast } from "@heroui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BillingBankTransactionRow } from "../types/billing-bank-transaction.types";
import {
  EMPTY_BANK_TRANSACTION_FILTERS,
  type SupportToolsBankTransactionFilters,
} from "../types/support-tools-filters.types";
import { buildBankTransactionFilterSuggestions } from "../utils/bank-transaction-filter-suggestions.utils";
import { isSupportToolsDateRangeValid } from "../utils/support-tools-filters.utils";
import { billingDrawerClassNames } from "./billing-drawer.shared";
import { SupportToolsDateRangeFields } from "./support-tools/SupportToolsDateRangeFields";
import { SupportToolsFilterAutocomplete } from "./support-tools/SupportToolsFilterAutocomplete";
import { SupportToolsFilterField } from "./support-tools/SupportToolsFilterField";
import { SupportToolsFiltersDrawerFooter } from "./support-tools/SupportToolsFiltersDrawerFooter";
import { SupportToolsMultiSelectFilter } from "./support-tools/SupportToolsMultiSelectFilter";
import {
  SUPPORT_TOOLS_BANK_STATUS_OPTIONS,
  SUPPORT_TOOLS_MICRO_DEPOSIT_OPTIONS,
  SUPPORT_TOOLS_ORIGIN_OPTIONS,
  SUPPORT_TOOLS_PIX_KEY_TYPE_OPTIONS,
  SUPPORT_TOOLS_COMMA_SEPARATED_HINT,
} from "./support-tools/support-tools-filter-options";

interface BillingBankTransactionsFiltersDrawerProps {
  isOpen: boolean;
  filters: SupportToolsBankTransactionFilters;
  suggestionRows: BillingBankTransactionRow[];
  onOpenChange: (isOpen: boolean) => void;
  onApply: (filters: SupportToolsBankTransactionFilters) => void;
  onClear: () => void;
}

export function BillingBankTransactionsFiltersDrawer({
  isOpen,
  filters,
  suggestionRows,
  onOpenChange,
  onApply,
  onClear,
}: BillingBankTransactionsFiltersDrawerProps) {
  const drawerWasOpenRef = useRef(false);
  const [local, setLocal] = useState(filters);

  const suggestions = useMemo(
    () => buildBankTransactionFilterSuggestions(suggestionRows),
    [suggestionRows],
  );

  useEffect(() => {
    if (!isOpen) {
      drawerWasOpenRef.current = false;
      return;
    }
    if (drawerWasOpenRef.current) return;
    drawerWasOpenRef.current = true;
    setLocal(filters);
  }, [filters, isOpen]);

  const patch = (partial: Partial<SupportToolsBankTransactionFilters>) => {
    setLocal((prev) => ({ ...prev, ...partial }));
  };

  const handleApply = () => {
    if (!isSupportToolsDateRangeValid(local.startDate, local.endDate)) {
      addToast({
        title: "Período inválido",
        description: "A data inicial deve ser anterior ou igual à data final.",
        color: "warning",
        timeout: 4000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    if ((local.startDate && !local.endDate) || (!local.startDate && local.endDate)) {
      addToast({
        title: "Período incompleto",
        description: "Selecione a data inicial e a data final.",
        color: "warning",
        timeout: 4000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    onApply(local);
    onOpenChange(false);
  };

  const handleClear = () => {
    setLocal(EMPTY_BANK_TRANSACTION_FILTERS);
    onClear();
  };

  return (
    <DynamicDrawer
      size="lg"
      title="Filtros"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={billingDrawerClassNames}
      component={
        <div className="flex flex-col gap-4">
          <SupportToolsDateRangeFields
            startDate={local.startDate}
            endDate={local.endDate}
            onStartDateChange={(value) => patch({ startDate: value })}
            onEndDateChange={(value) => patch({ endDate: value })}
          />

          <SupportToolsMultiSelectFilter
            label="Micro depósitos"
            ariaLabel="Micro depósitos"
            placeholder="Selecione o status do microdepósito"
            options={SUPPORT_TOOLS_MICRO_DEPOSIT_OPTIONS}
            values={local.microDeposits}
            onChange={(values) => patch({ microDeposits: values })}
          />

          <SupportToolsMultiSelectFilter
            label="Status"
            ariaLabel="Status"
            placeholder="Selecione o status"
            options={SUPPORT_TOOLS_BANK_STATUS_OPTIONS}
            values={local.statusCodes}
            onChange={(values) => patch({ statusCodes: values })}
          />

          <SupportToolsFilterField label="Fonte">
            <SupportToolsFilterAutocomplete
              ariaLabel="Fonte"
              selectedValues={local.sourceNames}
              onSelectedValuesChange={(values) => patch({ sourceNames: values })}
              suggestions={suggestions.sourceNames}
              placeholder="Digite para buscar a fonte"
            />
          </SupportToolsFilterField>

          <SupportToolsMultiSelectFilter
            label="Origem"
            ariaLabel="Origem"
            placeholder="Selecione a origem"
            options={SUPPORT_TOOLS_ORIGIN_OPTIONS}
            values={local.origins}
            onChange={(values) => patch({ origins: values })}
          />

          <SupportToolsFilterField label="Documento" hint={SUPPORT_TOOLS_COMMA_SEPARATED_HINT}>
            <Input
              aria-label="Documento"
              value={local.document}
              onValueChange={(value) => patch({ document: value })}
              radius="sm"
              classNames={defaultInputClassNames}
            />
          </SupportToolsFilterField>

          <SupportToolsMultiSelectFilter
            label="Tipo de chave pix"
            ariaLabel="Tipo de chave pix"
            placeholder="Selecione o tipo"
            options={SUPPORT_TOOLS_PIX_KEY_TYPE_OPTIONS}
            values={local.pixKeyTypes}
            onChange={(values) => patch({ pixKeyTypes: values })}
          />

          <SupportToolsFilterField label="Chave pix" hint={SUPPORT_TOOLS_COMMA_SEPARATED_HINT}>
            <Input
              aria-label="Chave pix"
              value={local.pixKey}
              onValueChange={(value) => patch({ pixKey: value })}
              radius="sm"
              classNames={defaultInputClassNames}
            />
          </SupportToolsFilterField>

          <SupportToolsFilterField label="Código do banco" hint={SUPPORT_TOOLS_COMMA_SEPARATED_HINT}>
            <Input
              aria-label="Código do banco"
              value={local.bankCode}
              onValueChange={(value) => patch({ bankCode: value })}
              radius="sm"
              classNames={defaultInputClassNames}
            />
          </SupportToolsFilterField>

          <SupportToolsFilterField label="Agência" hint={SUPPORT_TOOLS_COMMA_SEPARATED_HINT}>
            <Input
              aria-label="Agência"
              value={local.bankBranch}
              onValueChange={(value) => patch({ bankBranch: value })}
              radius="sm"
              classNames={defaultInputClassNames}
            />
          </SupportToolsFilterField>

          <SupportToolsFilterField label="Conta corrente" hint={SUPPORT_TOOLS_COMMA_SEPARATED_HINT}>
            <Input
              aria-label="Conta corrente"
              value={local.bankAccount}
              onValueChange={(value) => patch({ bankAccount: value })}
              radius="sm"
              classNames={defaultInputClassNames}
            />
          </SupportToolsFilterField>

          <SupportToolsFilterField label="Cliente">
            <SupportToolsFilterAutocomplete
              ariaLabel="Cliente"
              selectedValues={local.clients}
              onSelectedValuesChange={(values) => patch({ clients: values })}
              suggestions={suggestions.clientNames}
              placeholder="Digite para buscar o cliente"
            />
          </SupportToolsFilterField>

          <SupportToolsFilterField label="Usuário">
            <SupportToolsFilterAutocomplete
              ariaLabel="Usuário"
              selectedValues={local.usernames}
              onSelectedValuesChange={(values) => patch({ usernames: values })}
              suggestions={suggestions.usernames}
              placeholder="Digite para buscar o usuário"
            />
          </SupportToolsFilterField>
        </div>
      }
      footer={
        <SupportToolsFiltersDrawerFooter
          onClose={() => onOpenChange(false)}
          onClear={handleClear}
          onApply={handleApply}
        />
      }
    />
  );
}
