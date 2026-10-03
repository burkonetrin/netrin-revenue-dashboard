"use client";

/**
 * Drawer para registrar ajustes monetários e operacionais em uma fatura.
 */

import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { defaultInputClassNames, defaultSelectClassNames } from "@/shared/styles/inputClassNames";
import {
  DatePicker,
  Select,
  SelectItem,
  Textarea,
  type DateValue,
} from "@heroui/react";
import { Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSubmitEntryAdjustment } from "../hooks/useSubmitEntryAdjustment";
import type { BillingInvoiceDetail } from "../types/billing-detail.types";
import {
  getMonetaryTargetLabel,
  MONETARY_TARGET_OPTIONS,
  type BillingAdjustmentFieldErrors,
  type BillingAdjustmentFormState,
  type BillingAdjustmentType,
  type BillingMonetaryTarget,
} from "../types/billing-adjustment.types";
import type { BillingInvoiceScope } from "../types/billing.types";
import {
  ADJUSTMENT_TYPE_OPTIONS,
  EMPTY_ADJUSTMENT_FORM,
  buildAdjustmentFormForType,
  buildAdjustmentPayload,
  buildCompetenceMonthOptions,
  getContractOptions,
  getFranchiseOptions,
  getMixedAdjustmentTargetOptions,
  getVisibleFields,
  validateAdjustmentForm,
  withContractPrefixedDescription,
  withFranchisePrefixedDescription,
} from "../utils/billing-adjustment.utils";
import { CLIENTS_PERMISSIONS } from "@/features/clients/constants/clientsPermissions.constants";
import { usePermission } from "@/shared/hooks/usePermission";
import { canClientsOrBillingInvoice } from "../constants/billingInvoicePermissions.constants";
import {
  BillingCurrencyAmountInput,
  BillingDrawerFormFooter,
  BillingMonthYearSelect,
  billingDrawerClassNames,
  safeParseDate,
} from "./billing-drawer.shared";

interface BillingInvoiceAdjustmentsDrawerProps {
  isOpen: boolean;
  invoice: BillingInvoiceDetail;
  scope: BillingInvoiceScope;
  onOpenChange: (isOpen: boolean) => void;
}

/**
 * Drawer para criar ajustes na fatura.
 */
export function BillingInvoiceAdjustmentsDrawer({
  isOpen,
  invoice,
  scope,
  onOpenChange,
}: BillingInvoiceAdjustmentsDrawerProps) {
  const { can, rbacPermissions } = usePermission();
  const [form, setForm] = useState<BillingAdjustmentFormState>(EMPTY_ADJUSTMENT_FORM);
  const [errors, setErrors] = useState<BillingAdjustmentFieldErrors>({});
  const { mutateAsync: submitAdjustment, isPending: isSubmitting } = useSubmitEntryAdjustment();

  const allowedAdjustmentOptions = useMemo(
    () =>
      ADJUSTMENT_TYPE_OPTIONS.filter((option) => {
        switch (option.value) {
          case "discount":
            return canClientsOrBillingInvoice(can, CLIENTS_PERMISSIONS.adjustDiscount);
          case "surcharge":
            return canClientsOrBillingInvoice(can, CLIENTS_PERMISSIONS.adjustAddition);
          case "due_date":
            return canClientsOrBillingInvoice(can, CLIENTS_PERMISSIONS.adjustDueDate);
          case "competence":
            return canClientsOrBillingInvoice(can, CLIENTS_PERMISSIONS.adjustCompetence);
          case "invoice_description":
            return canClientsOrBillingInvoice(can, CLIENTS_PERMISSIONS.adjustDescription);
          default:
            return false;
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- can é derivado de rbacPermissions
    [rbacPermissions],
  );

  const mixedTargetOptions = useMemo(() => getMixedAdjustmentTargetOptions(invoice), [invoice]);
  const visibleFields = getVisibleFields(
    form.adjustmentType,
    scope,
    form.monetaryTarget,
    mixedTargetOptions.hasMixedModes,
  );
  const contractOptions = useMemo(
    () => (mixedTargetOptions.hasMixedModes ? mixedTargetOptions.contractOptions : getContractOptions(invoice)),
    [invoice, mixedTargetOptions],
  );
  const franchiseOptions = useMemo(
    () => (mixedTargetOptions.hasMixedModes ? mixedTargetOptions.franchiseOptions : getFranchiseOptions(invoice)),
    [invoice, mixedTargetOptions],
  );
  const competenceOptions = useMemo(
    () => buildCompetenceMonthOptions(form.competence),
    [form.competence],
  );
  const groupedContractNames = useMemo(() => {
    if (form.adjustmentType !== "due_date" || !form.contractId) return [];
    const selected = invoice.contracts.find((contract) => contract.id === form.contractId) as
      | (BillingInvoiceDetail["contracts"][number] & { groupId?: string })
      | undefined;
    if (!selected?.groupId) return [];
    return invoice.contracts
      .filter(
        (contract) =>
          (contract as BillingInvoiceDetail["contracts"][number] & { groupId?: string }).groupId ===
          selected.groupId &&
          contract.name.trim(),
      )
      .map((contract) => contract.name)
      .filter((name, index, names) => names.indexOf(name) === index);
  }, [form.adjustmentType, form.contractId, invoice.contracts]);

  useEffect(() => {
    if (!isOpen) return;

    setForm(EMPTY_ADJUSTMENT_FORM);
    setErrors({});
  }, [isOpen]);

  const updateForm = (patch: Partial<BillingAdjustmentFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch) as Array<keyof BillingAdjustmentFormState>) {
        delete next[key];
      }
      return next;
    });
  };

  const handleAdjustmentTypeChange = (type: BillingAdjustmentType) => {
    setForm(buildAdjustmentFormForType(type));
    setErrors({});
  };

  const handleMonetaryTargetChange = (target: BillingMonetaryTarget) => {
    updateForm({
      monetaryTarget: target,
      contractId: "",
      franchiseId: "",
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    const validationErrors = validateAdjustmentForm(form, scope, mixedTargetOptions.hasMixedModes);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const builtPayload = buildAdjustmentPayload(form);
    if (!builtPayload) return;

    const payload = withContractPrefixedDescription(
      withFranchisePrefixedDescription(builtPayload, invoice),
      invoice,
    );

    try {
      await submitAdjustment({
        entryId: invoice.id,
        clientId: invoice.clientId,
        scope,
        payload,
      });
      handleClose();
    } catch {
      // Error toast handled by useSubmitEntryAdjustment
    }
  };

  return (
    <DynamicDrawer
      size="lg"
      title="Ajuste da fatura"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={billingDrawerClassNames}
      component={
        <div className="flex flex-col gap-6">
          <Select
            label="Tipo de ajuste"
            labelPlacement="outside"
            placeholder="Selecione uma opção"
            selectedKeys={form.adjustmentType ? [form.adjustmentType] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as BillingAdjustmentType | undefined;
              if (selected) handleAdjustmentTypeChange(selected);
            }}
            isRequired
            isInvalid={Boolean(errors.adjustmentType)}
            errorMessage={errors.adjustmentType}
            radius="sm"
            className="w-full"
            classNames={defaultSelectClassNames}
          >
            {allowedAdjustmentOptions.map((option) => (
              <SelectItem key={option.value} textValue={option.label}>
                {option.label}
              </SelectItem>
            ))}
          </Select>

          {visibleFields.monetaryTarget ? (
            <Select
              label={getMonetaryTargetLabel(form.adjustmentType)}
              labelPlacement="outside"
              placeholder="Selecione uma opção"
              selectedKeys={form.monetaryTarget ? [form.monetaryTarget] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as BillingMonetaryTarget | undefined;
                if (selected) handleMonetaryTargetChange(selected);
              }}
              isRequired
              isInvalid={Boolean(errors.monetaryTarget)}
              errorMessage={errors.monetaryTarget}
              radius="sm"
              className="w-full"
              classNames={defaultSelectClassNames}
            >
              {MONETARY_TARGET_OPTIONS.map((option) => (
                <SelectItem key={option.value} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          ) : null}

          {visibleFields.contract ? (
            <Select
              label="Contrato"
              labelPlacement="outside"
              placeholder="Selecione um contrato"
              selectedKeys={form.contractId ? [form.contractId] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string | undefined;
                updateForm({ contractId: selected ?? "" });
              }}
              isRequired
              isInvalid={Boolean(errors.contractId)}
              errorMessage={errors.contractId}
              radius="sm"
              className="w-full"
              classNames={defaultSelectClassNames}
            >
              {contractOptions.map((option) => (
                <SelectItem key={option.value} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          ) : null}

          {groupedContractNames.length >= 2 ? (
            <div className="flex items-center gap-4 rounded bg-sky-100 p-4 text-xs leading-6" role="status">
              <Info aria-hidden="true" className="shrink-0 text-gray-900" size={24} />
              <div>
                <p>
                  O valor deste contrato está incluso na mesma nota fiscal que outros contratos. O
                  novo vencimento será aplicado a todos:
                </p>
                {groupedContractNames.map((name) => (
                  <p key={name}>{name}</p>
                ))}
              </div>
            </div>
          ) : null}

          {visibleFields.franchise ? (
            <Select
              label="Franquia"
              labelPlacement="outside"
              placeholder="Selecione uma franquia"
              selectedKeys={form.franchiseId ? [form.franchiseId] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string | undefined;
                updateForm({ franchiseId: selected ?? "" });
              }}
              isRequired
              isInvalid={Boolean(errors.franchiseId)}
              errorMessage={errors.franchiseId}
              radius="sm"
              className="w-full"
              classNames={defaultSelectClassNames}
            >
              {franchiseOptions.map((option) => (
                <SelectItem key={option.value} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          ) : null}

          {visibleFields.amount ? (
            <BillingCurrencyAmountInput
              label="Valor do ajuste"
              value={form.amount}
              onValueChange={(amount) => updateForm({ amount })}
              isInvalid={Boolean(errors.amount)}
              errorMessage={errors.amount}
            />
          ) : null}

          {visibleFields.dueDate ? (
            <DatePicker
              label="Nova data de vencimento"
              labelPlacement="outside"
              value={safeParseDate(form.dueDate)}
              onChange={(date: DateValue | null) => {
                updateForm({ dueDate: date?.toString() ?? "" });
              }}
              isRequired
              isInvalid={Boolean(errors.dueDate)}
              errorMessage={errors.dueDate}
              className="w-full"
              classNames={defaultInputClassNames}
            />
          ) : null}

          {visibleFields.competence ? (
            <BillingMonthYearSelect
              label="Data de competência"
              placeholder="Selecione o mês de competência"
              value={form.competence}
              options={competenceOptions}
              onValueChange={(competence) => updateForm({ competence })}
              isInvalid={Boolean(errors.competence)}
              errorMessage={errors.competence}
            />
          ) : null}

          {visibleFields.invoiceDescription ? (
            <Textarea
              label="Descrição da fatura"
              labelPlacement="outside"
              placeholder="Descreva a nova descrição da fatura"
              value={form.invoiceDescription}
              onValueChange={(value) => updateForm({ invoiceDescription: value })}
              isRequired
              isInvalid={Boolean(errors.invoiceDescription)}
              errorMessage={errors.invoiceDescription}
              minRows={4}
              radius="sm"
              classNames={defaultInputClassNames}
            />
          ) : null}

          {visibleFields.adjustmentDescription ? (
            <Textarea
              label="Descrição do ajuste"
              labelPlacement="outside"
              placeholder="Descreva o motivo do ajuste"
              value={form.adjustmentDescription}
              onValueChange={(value) => updateForm({ adjustmentDescription: value })}
              isRequired
              isInvalid={Boolean(errors.adjustmentDescription)}
              errorMessage={errors.adjustmentDescription}
              minRows={4}
              radius="sm"
              classNames={defaultInputClassNames}
            />
          ) : null}
        </div>
      }
      footer={
        <BillingDrawerFormFooter
          onCancel={handleClose}
          onSave={handleSubmit}
          saveLabel="Salvar ajuste"
          isLoading={isSubmitting}
        />
      }
    />
  );
}
