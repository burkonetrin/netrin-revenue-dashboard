"use client";

import { defaultInputClassNames, defaultSelectClassNames } from "@/shared/styles/inputClassNames";
import { maskCurrency } from "@/shared/utils/currency";
import { Button, DatePicker, Input, Select, SelectItem } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";
import { Upload, X } from "lucide-react";
import { type ComponentProps, useRef, useState } from "react";
import { buildBillingMonthOptions } from "../../billing/utils/billing-month.utils";
import { ProviderInvoiceFieldLabel } from "./ProviderInvoiceFieldLabel";

export interface ProviderInvoiceCommonFieldsValue {
  competenceMonth: string;
  assessmentStartDate: string;
  assessmentEndDate: string;
  invoiceTotalValue: string;
  minimumFranchiseValue: string;
  invoiceFile: File | null;
}

export type ProviderInvoiceCommonFieldsErrors = Partial<
  Record<
    | "competenceMonth"
    | "assessmentStartDate"
    | "assessmentEndDate"
    | "invoiceTotalValue"
    | "minimumFranchiseValue",
    string
  >
>;

export interface ProviderInvoiceCommonFieldsProps {
  value: ProviderInvoiceCommonFieldsValue;
  onChange: (patch: Partial<ProviderInvoiceCommonFieldsValue>) => void;
  errors?: ProviderInvoiceCommonFieldsErrors;
  unavailableCompetenceMonths?: ReadonlySet<string>;
  isDisabled?: boolean;
  variant?: "indirect-postpaid" | "direct-postpaid";
}

type DatePickerValue = ComponentProps<typeof DatePicker>["value"];

function safeParseDate(value: string): DatePickerValue {
  if (!value) return null;
  try {
    return parseDate(value) as unknown as DatePickerValue;
  } catch {
    return null;
  }
}

function maskOptionalCurrency(value: string): string {
  return value ? maskCurrency(value) : "";
}

function toBillingMonthValue(value: string): string | null {
  const match = /^(0[1-9]|1[0-2])\/(\d{4})$/.exec(value.trim());
  return match ? `${match[2]}-${match[1]}` : null;
}

function toFormCompetenceValue(value: string): string {
  const [year, month] = value.split("-");
  return `${month}/${year}`;
}

const providerInvoiceFieldClassNames = {
  ...defaultInputClassNames,
  base: "w-full",
};

const providerInvoiceSelectClassNames = {
  ...defaultSelectClassNames,
  base: "w-full",
};

const acceptedInvoiceFileExtensions = [
  "pdf",
  "doc",
  "docx",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "tif",
  "tiff",
  "avif",
  "heic",
  "heif",
] as const;

const acceptedInvoiceFileTypes = acceptedInvoiceFileExtensions.map((extension) => `.${extension}`).join(",");
const invalidInvoiceFileMessage = "Selecione um documento ou imagem em formato permitido.";

function isAcceptedInvoiceFile(file: File): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension !== undefined && acceptedInvoiceFileExtensions.includes(extension as never);
}

export function ProviderInvoiceCommonFields({
  value,
  onChange,
  errors,
  unavailableCompetenceMonths = new Set<string>(),
  isDisabled = false,
  variant = "indirect-postpaid",
}: ProviderInvoiceCommonFieldsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string>();
  const selectedBillingMonth = toBillingMonthValue(value.competenceMonth);
  const competenceOptions = buildBillingMonthOptions(
    selectedBillingMonth ? [selectedBillingMonth] : [],
  )
    .filter(
      (option) =>
        !unavailableCompetenceMonths.has(option.value) || option.value === selectedBillingMonth,
    )
    .map((option) => ({ ...option, value: toFormCompetenceValue(option.value) }));

  const fileField = (
    <div className="flex flex-col gap-3 rounded-xl border border-default-300 px-5 pb-5 pt-3">
      <span className="text-sm text-[#52525B]">Arquivo da fatura</span>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="bordered"
          radius="sm"
          startContent={<Upload size={16} />}
          isDisabled={isDisabled}
          onPress={() => fileInputRef.current?.click()}
        >
          Importar
        </Button>
        {value.invoiceFile ? (
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <span className="min-w-0 truncate text-sm text-default-500">
              {value.invoiceFile.name}
            </span>
            <Button
              type="button"
              variant="light"
              size="sm"
              isIconOnly
              aria-label="Remover arquivo"
              isDisabled={isDisabled}
              className="shrink-0 text-danger"
              onPress={() => {
                if (fileInputRef.current) fileInputRef.current.value = "";
                setFileError(undefined);
                onChange({ invoiceFile: null });
              }}
            >
              <X size={16} />
            </Button>
          </div>
        ) : (
          <span className="truncate text-sm text-default-500">Nenhum arquivo selecionado</span>
        )}
      </div>
      {fileError ? (
        <p className="text-sm text-danger" role="alert">
          {fileError}
        </p>
      ) : null}
      <input
        ref={fileInputRef}
        data-testid="provider-invoice-file-input"
        type="file"
        accept={acceptedInvoiceFileTypes}
        className="hidden"
        disabled={isDisabled}
        onChange={(event) => {
          const invoiceFile = event.target.files?.[0] ?? null;

          if (!invoiceFile) {
            setFileError(undefined);
            onChange({ invoiceFile: null });
            return;
          }

          if (!isAcceptedInvoiceFile(invoiceFile)) {
            event.target.value = "";
            setFileError(invalidInvoiceFileMessage);
            return;
          }

          setFileError(undefined);
          onChange({ invoiceFile });
        }}
      />
    </div>
  );

  const periodFields = (
    <div
      className={
        variant === "direct-postpaid"
          ? "grid grid-cols-1 items-start gap-4 md:grid-cols-3"
          : "grid grid-cols-1 items-start gap-4 md:grid-cols-4"
      }
    >
      <div className="flex min-w-0 flex-col gap-3">
        <ProviderInvoiceFieldLabel isRequired>Competência</ProviderInvoiceFieldLabel>
        <Select
          aria-label="Competência"
          placeholder="Selecione um mês"
          selectedKeys={value.competenceMonth ? [value.competenceMonth] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string | undefined;
            onChange({ competenceMonth: selected ?? "" });
          }}
          isRequired
          isDisabled={isDisabled}
          isInvalid={Boolean(errors?.competenceMonth)}
          errorMessage={errors?.competenceMonth}
          radius="sm"
          classNames={providerInvoiceSelectClassNames}
        >
          {competenceOptions.map((option) => (
            <SelectItem key={option.value} textValue={option.label}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <ProviderInvoiceFieldLabel isRequired>Período inicial</ProviderInvoiceFieldLabel>
        <DatePicker
          aria-label="Período inicial"
          value={safeParseDate(value.assessmentStartDate)}
          onChange={(date: DateValue | null) =>
            onChange({ assessmentStartDate: date?.toString() ?? "" })
          }
          isRequired
          isDisabled={isDisabled}
          isInvalid={Boolean(errors?.assessmentStartDate)}
          errorMessage={errors?.assessmentStartDate}
          classNames={providerInvoiceFieldClassNames}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <ProviderInvoiceFieldLabel isRequired>Período final</ProviderInvoiceFieldLabel>
        <DatePicker
          aria-label="Período final"
          value={safeParseDate(value.assessmentEndDate)}
          onChange={(date: DateValue | null) =>
            onChange({ assessmentEndDate: date?.toString() ?? "" })
          }
          isRequired
          isDisabled={isDisabled}
          isInvalid={Boolean(errors?.assessmentEndDate)}
          errorMessage={errors?.assessmentEndDate}
          classNames={providerInvoiceFieldClassNames}
        />
      </div>

      {variant === "indirect-postpaid" ? (
        <div className="flex min-w-0 flex-col gap-3">
          <ProviderInvoiceFieldLabel isRequired>Valor total (R$)</ProviderInvoiceFieldLabel>
          <Input
            aria-label="Valor total (R$)"
            placeholder="0,00"
            value={value.invoiceTotalValue}
            onValueChange={(invoiceTotalValue) =>
              onChange({ invoiceTotalValue: maskOptionalCurrency(invoiceTotalValue) })
            }
            isRequired
            isDisabled={isDisabled}
            isInvalid={Boolean(errors?.invoiceTotalValue)}
            errorMessage={errors?.invoiceTotalValue}
            radius="sm"
            classNames={providerInvoiceFieldClassNames}
          />
        </div>
      ) : null}
    </div>
  );

  const franchiseField = (
    <div className="flex min-w-0 flex-col gap-3">
      <ProviderInvoiceFieldLabel>
        Valor mínimo de franquia (R$) - Opcional
      </ProviderInvoiceFieldLabel>
      <Input
        aria-label="Valor mínimo de franquia (R$) - Opcional"
        placeholder="R$ 0,00"
        value={value.minimumFranchiseValue}
        onValueChange={(minimumFranchiseValue) =>
          onChange({ minimumFranchiseValue: maskOptionalCurrency(minimumFranchiseValue) })
        }
        isDisabled={isDisabled}
        isInvalid={Boolean(errors?.minimumFranchiseValue)}
        errorMessage={errors?.minimumFranchiseValue}
        radius="sm"
        classNames={providerInvoiceFieldClassNames}
      />
    </div>
  );

  if (variant === "direct-postpaid") {
    return (
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <h3 className="text-base font-medium text-[#52525B]">Período</h3>
          {periodFields}
        </section>
        <div
          aria-hidden="true"
          className="h-px w-full bg-[#111111]/15"
          data-testid="provider-invoice-period-values-divider"
        />
        <section className="flex flex-col gap-4">
          <h3 className="text-base font-medium text-[#52525B]">Valores</h3>
          {fileField}
          {franchiseField}
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {fileField}
      {periodFields}
      {franchiseField}
    </div>
  );
}
