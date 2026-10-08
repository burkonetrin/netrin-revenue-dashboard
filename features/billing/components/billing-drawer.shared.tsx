"use client";

import { Button, DatePicker, Input, Select, SelectItem } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import type { ComponentProps } from "react";
import { defaultInputClassNames, defaultSelectClassNames } from "@/shared/styles/inputClassNames";
import { maskCurrency4 } from "@/shared/utils/currency";

export const billingDrawerClassNames = {
  base: "max-w-[504px]",
  header: "font-bold text-gray-950",
  body: "flex-1! mb-0",
  footer: "border-t-0 pb-0!",
} as const;

type DatePickerValue = ComponentProps<typeof DatePicker>["value"];

/** Converte string YYYY-MM-DD em valor do DatePicker, ou null se inválida. */
export function safeParseDate(value: string): DatePickerValue {
  if (!value) return null;

  try {
    return parseDate(value) as unknown as DatePickerValue;
  } catch {
    return null;
  }
}

interface BillingDrawerFormFooterProps {
  onCancel: () => void;
  onSave: () => void;
  saveLabel: string;
  isLoading?: boolean;
  isSaveDisabled?: boolean;
}

/** Rodapé Cancelar/Salvar dos drawers de fatura e ajuste. */
export function BillingDrawerFormFooter({
  onCancel,
  onSave,
  saveLabel,
  isLoading = false,
  isSaveDisabled = false,
}: BillingDrawerFormFooterProps) {
  return (
    <div className="flex w-full justify-end gap-2.5">
      <Button
        variant="light"
        onPress={onCancel}
        isDisabled={isLoading}
        className="h-10 border border-gray-300 px-6"
      >
        Cancelar
      </Button>
      <Button
        color="primary"
        onPress={onSave}
        isLoading={isLoading}
        isDisabled={isSaveDisabled}
        className="h-10 px-6"
      >
        {saveLabel}
      </Button>
    </div>
  );
}

interface BillingCurrencyAmountInputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  isRequired?: boolean;
}

/** Input de valor monetário com máscara de moeda. */
export function BillingCurrencyAmountInput({
  label,
  value,
  onValueChange,
  isInvalid,
  errorMessage,
  isRequired = true,
}: BillingCurrencyAmountInputProps) {
  return (
    <Input
      label={label}
      labelPlacement="outside"
      placeholder="0,0000"
      value={value}
      onValueChange={(next) => onValueChange(maskCurrency4(next))}
      isRequired={isRequired}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      radius="sm"
      classNames={defaultInputClassNames}
    />
  );
}

interface BillingMonthOption {
  value: string;
  label: string;
}

interface BillingMonthYearSelectProps {
  label: string;
  placeholder?: string;
  value: string;
  options: BillingMonthOption[];
  onValueChange: (value: string) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
}

/** Select de mês/ano (competência ou vencimento). */
export function BillingMonthYearSelect({
  label,
  placeholder = "-- de ----",
  value,
  options,
  onValueChange,
  isInvalid,
  errorMessage,
  isRequired = true,
  isDisabled = false,
}: BillingMonthYearSelectProps) {
  return (
    <Select
      label={label}
      labelPlacement="outside"
      placeholder={placeholder}
      selectedKeys={value ? [value] : []}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0] as string | undefined;
        onValueChange(selected ?? "");
      }}
      isRequired={isRequired}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      isDisabled={isDisabled}
      radius="sm"
      className="w-full"
      classNames={defaultSelectClassNames}
    >
      {options.map((option) => (
        <SelectItem key={option.value} textValue={option.label}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
}

interface BillingProfitCenterSelectProps {
  label: string;
  value: string;
  options: BillingMonthOption[];
  onValueChange: (value: string) => void;
  isRequired?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
}

/** Select de centro de lucro (obrigatório ou opcional). */
export function BillingProfitCenterSelect({
  label,
  value,
  options,
  onValueChange,
  isRequired = false,
  isInvalid,
  errorMessage,
  isLoading,
  isDisabled,
}: BillingProfitCenterSelectProps) {
  return (
    <Select
      label={label}
      labelPlacement="outside"
      placeholder="Selecione uma opção"
      selectedKeys={value ? [value] : []}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0] as string | undefined;
        onValueChange(selected ?? "");
      }}
      isRequired={isRequired}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      isLoading={isLoading}
      isDisabled={isDisabled}
      radius="sm"
      className="w-full"
      classNames={defaultSelectClassNames}
    >
      {options.map((option) => (
        <SelectItem key={option.value} textValue={option.label}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
}
