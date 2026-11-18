"use client";

import { defaultInputClassNames, defaultSelectClassNames } from "@/shared/styles/inputClassNames";
import { Checkbox, Input, Select, SelectItem } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import type {
  PaymentArrangement,
  PaymentDueType,
  PaymentInfoFormValues,
} from "../types/contractsFranchises.types";
import {
  refinePaymentInfoFormValues,
  refinePaymentInfoProfitCenter,
  requiredMessage,
} from "../utils/paymentInfoFormValidation.utils";
const fieldLabelClassName = "text-sm text-zinc-500";
const fieldWrapperClassName = "flex flex-col gap-2";
const paymentSelectClassNames = {
  ...defaultSelectClassNames,
  value: "text-gray-700! text-sm",
};

/**
 * Opção de centro de lucro para select.
 */
export interface ProfitCenterSelectOption {
  value: string;
  label: string;
}

const paymentArrangementOptions: Array<{
  value: PaymentArrangement;
  label: string;
  description: string;
}> = [
  {
    value: "standard",
    label: "Padrão",
    description: "Competência padrão em relação à periodicidade de faturamento",
  },
  {
    value: "prepaid",
    label: "Pré-pago",
    description: "Antecipa a competência em relação à periodicidade de faturamento",
  },
  {
    value: "postpaid",
    label: "Pós-pago",
    description: "Posterga a competência em relação à periodicidade de faturamento",
  },
];

const branchCodeOptions = [
  { value: "2001", label: "2001 - São Leopoldo" },
  { value: "2002", label: "2002 - Curitiba" },
];

const dueTypeOptions: Array<{ value: PaymentDueType; label: string }> = [
  { value: "standard", label: "Padrão" },
  { value: "weekday", label: "Dia da semana" },
  { value: "specific_day", label: "Dia específico do mês" },
];

const weekdayOptions = [
  { value: "0", label: "Segunda-feira" },
  { value: "1", label: "Terça-feira" },
  { value: "2", label: "Quarta-feira" },
  { value: "3", label: "Quinta-feira" },
  { value: "4", label: "Sexta-feira" },
  { value: "5", label: "Sábado" },
  { value: "6", label: "Domingo" },
];

const paymentMethodOptions = [
  { value: "BOLETO", label: "Boleto" },
  { value: "TRANSFERENCIA_BANCARIA", label: "Transferência bancária" },
];

const currencyOptions = [
  { value: "BRL", label: "BRL - Real Brasileiro" },
  { value: "USD", label: "USD - Dólar" },
];

const paymentMethodSchema = z
  .union([z.literal("BOLETO"), z.literal("TRANSFERENCIA_BANCARIA"), z.literal("")])
  .refine((value) => value !== "", requiredMessage);

const currencySchema = z
  .union([z.literal("BRL"), z.literal("USD"), z.literal("")])
  .refine((value) => value !== "", requiredMessage);

/**
 * Valores padrão do formulário de pagamento.
 */
const PAYMENT_ON_ISSUE_LABEL =
  "Pagamento à vista (vencimento no dia da emissão da nota)";

export const defaultPaymentInfoFormValues: PaymentInfoFormValues = {
  nfeBranch: "1420 - São Leopoldo",
  nfeBranchCode: "2001",
  paymentOnInvoiceIssueDate: false,
  paymentArrangement: "standard",
  paymentPrepaidMonths: "",
  paymentPostpaidMonths: "",
  paymentMethod: "BOLETO",
  currency: "BRL",
  profitCenter: "",
  overflowProfitCenter: "",
  additionalDays: "30",
  billingPeriodicity: "1",
  dueType: "standard",
  dueWeekday: "",
  dueSpecificDay: "",
  dueDateRangeStart: "",
  dueDateRangeEnd: "",
  addClientConsumptionInfo: true,
  addBankInfo: false,
  addOrderNote: false,
  orderNote: "",
};

const basePaymentInfoFormSchema = z
  .object({
    nfeBranch: z.string(),
    nfeBranchCode: z.string().min(1, requiredMessage),
    paymentOnInvoiceIssueDate: z.boolean(),
    paymentArrangement: z.enum(["standard", "prepaid", "postpaid"]),
    paymentPrepaidMonths: z.string(),
    paymentPostpaidMonths: z.string(),
    paymentMethod: paymentMethodSchema,
    currency: currencySchema,
    profitCenter: z.string(),
    overflowProfitCenter: z.string(),
    additionalDays: z.string(),
    billingPeriodicity: z.string().trim().min(1, requiredMessage),
    dueType: z.enum(["standard", "weekday", "specific_day", "date_range"]),
    dueWeekday: z.string(),
    dueSpecificDay: z.string(),
    dueDateRangeStart: z.string(),
    dueDateRangeEnd: z.string(),
    addClientConsumptionInfo: z.boolean(),
    addBankInfo: z.boolean(),
    addOrderNote: z.boolean(),
    orderNote: z.string(),
  })
  .superRefine((values, context) => {
    refinePaymentInfoFormValues(values, context);
  });

function buildPaymentInfoFormSchema({
  showProfitCenterFields,
}: { showProfitCenterFields: boolean }) {
  return basePaymentInfoFormSchema.superRefine((values, context) => {
    refinePaymentInfoProfitCenter(values, context, showProfitCenterFields);
  });
}

interface FieldGroupProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

interface PaymentInfoFormProps {
  id?: string;
  className?: string;
  defaultValues?: Partial<PaymentInfoFormValues>;
  profitCenterOptions?: ProfitCenterSelectOption[];
  showProfitCenterFields?: boolean;
  onSubmit?: (values: PaymentInfoFormValues) => void | Promise<void>;
  apiRef?: React.Ref<PaymentInfoFormApi>;
  disableAutoReset?: boolean;
}

/**
 * API imperativa exposta pelo formulário de pagamento.
 */
export interface PaymentInfoFormApi {
  validateAndGetValues: () => Promise<PaymentInfoFormValues | null>;
}

function FieldGroup({ label, error, children }: FieldGroupProps) {
  return (
    <div className={fieldWrapperClassName}>
      <p className={fieldLabelClassName}>{label}</p>
      {children}
      {error && <p className="text-sm text-danger-500">{error}</p>}
    </div>
  );
}

function getInputClassNames(hasError: boolean) {
  return {
    ...defaultInputClassNames,
    inputWrapper: hasError
      ? `${defaultInputClassNames.inputWrapper} !border-danger-500 !border-2`
      : defaultInputClassNames.inputWrapper,
  };
}

function getSelectClassNames(hasError: boolean) {
  return {
    ...paymentSelectClassNames,
    trigger: hasError
      ? `${defaultSelectClassNames.trigger} !border-danger-500 !border-2`
      : defaultSelectClassNames.trigger,
  };
}

/**
 * Formulário reutilizável de informações de pagamento.
 */
export function PaymentInfoForm({
  id = "payment-info-form",
  className = "",
  defaultValues,
  profitCenterOptions = [],
  showProfitCenterFields = true,
  onSubmit,
  apiRef,
  disableAutoReset = false,
}: PaymentInfoFormProps) {
  const resolver = useMemo(
    () => zodResolver(buildPaymentInfoFormSchema({ showProfitCenterFields })),
    [showProfitCenterFields],
  );
  const {
    control,
    handleSubmit,
    getValues,
    reset,
    setValue,
    trigger,
    formState: { errors, isDirty },
    watch,
  } = useForm<PaymentInfoFormValues>({
    resolver,
    defaultValues: {
      ...defaultPaymentInfoFormValues,
      ...defaultValues,
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const mergedDefaultValues = useMemo(
    () => ({
      ...defaultPaymentInfoFormValues,
      ...defaultValues,
    }),
    [defaultValues],
  );
  const isDirtyRef = useRef(false);
  isDirtyRef.current = isDirty;

  useEffect(() => {
    if (disableAutoReset && isDirtyRef.current) return;
    reset(mergedDefaultValues);
  }, [disableAutoReset, mergedDefaultValues, reset]);

  useImperativeHandle(
    apiRef,
    () => ({
      validateAndGetValues: async () => {
        const isValid = await trigger();
        return isValid ? getValues() : null;
      },
    }),
    [getValues, trigger],
  );

  const submitForm = async (values: PaymentInfoFormValues) => {
    await onSubmit?.(values);
  };
  const showOrderNote = watch("addOrderNote");
  const paymentOnInvoiceIssueDate = watch("paymentOnInvoiceIssueDate");
  const selectedPaymentArrangement = watch("paymentArrangement");
  const selectedDueType = watch("dueType");
  const selectedPaymentArrangementDescription =
    paymentArrangementOptions.find((option) => option.value === selectedPaymentArrangement)
      ?.description ?? "";

  useEffect(() => {
    if (paymentOnInvoiceIssueDate) {
      setValue("paymentMethod", "TRANSFERENCIA_BANCARIA", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [paymentOnInvoiceIssueDate, setValue]);

  return (
    <form
      id={id}
      onSubmit={handleSubmit(submitForm)}
      className={`flex flex-col gap-6 ${className}`}
    >
      <Controller
        name="nfeBranchCode"
        control={control}
        render={({ field }) => (
          <FieldGroup label="Código filial" error={errors.nfeBranchCode?.message}>
            <Select
              aria-label="Código filial"
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => field.onChange(Array.from(keys)[0]?.toString() ?? "")}
              classNames={getSelectClassNames(Boolean(errors.nfeBranchCode))}
              isInvalid={Boolean(errors.nfeBranchCode)}
            >
              {branchCodeOptions.map((option) => (
                <SelectItem key={option.value}>{option.label}</SelectItem>
              ))}
            </Select>
          </FieldGroup>
        )}
      />

      <Controller
        name="currency"
        control={control}
        render={({ field }) => (
          <FieldGroup label="Moeda" error={errors.currency?.message}>
            <Select
              aria-label="Moeda"
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => field.onChange(Array.from(keys)[0]?.toString() ?? "")}
              classNames={getSelectClassNames(Boolean(errors.currency))}
              isInvalid={Boolean(errors.currency)}
            >
              {currencyOptions.map((item) => (
                <SelectItem key={item.value}>{item.label}</SelectItem>
              ))}
            </Select>
          </FieldGroup>
        )}
      />

      <Controller
        name="billingPeriodicity"
        control={control}
        render={({ field }) => (
          <FieldGroup
            label="Periodicidade de faturamento (Número de meses)"
            error={errors.billingPeriodicity?.message}
          >
            <Input
              {...field}
              aria-label="Periodicidade de faturamento"
              classNames={getInputClassNames(Boolean(errors.billingPeriodicity))}
              isInvalid={Boolean(errors.billingPeriodicity)}
            />
          </FieldGroup>
        )}
      />

      <Controller
        name="paymentArrangement"
        control={control}
        render={({ field }) => (
          <FieldGroup label="Mês de competência">
            <Select
              aria-label="Mês de competência"
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0]?.toString() as PaymentArrangement | undefined;
                if (!value) return;

                field.onChange(value);
                setValue("paymentPrepaidMonths", value === "prepaid" ? "1" : "");
                setValue("paymentPostpaidMonths", value === "postpaid" ? "1" : "");
              }}
              classNames={paymentSelectClassNames}
            >
              {paymentArrangementOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  description={option.description}
                  classNames={{ title: "text-sm text-zinc-900", description: "text-sm text-zinc-500" }}
                >
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <p data-testid="payment-arrangement-description" className="text-xs text-zinc-500">
              {selectedPaymentArrangementDescription}
            </p>
          </FieldGroup>
        )}
      />

      {selectedPaymentArrangement === "prepaid" && (
        <Controller
          name="paymentPrepaidMonths"
          control={control}
          render={({ field }) => (
            <FieldGroup
              label="Número de meses de antecipação"
              error={errors.paymentPrepaidMonths?.message}
            >
              <Input
                {...field}
                aria-label="Número de meses de antecipação"
                placeholder=" "
                inputMode="numeric"
                onValueChange={(value) => field.onChange(value.replace(/\D/g, ""))}
                classNames={getInputClassNames(Boolean(errors.paymentPrepaidMonths))}
                isInvalid={Boolean(errors.paymentPrepaidMonths)}
              />
            </FieldGroup>
          )}
        />
      )}

      {selectedPaymentArrangement === "postpaid" && (
        <Controller
          name="paymentPostpaidMonths"
          control={control}
          render={({ field }) => (
            <FieldGroup
              label="Número de meses de postergação"
              error={errors.paymentPostpaidMonths?.message}
            >
              <Input
                {...field}
                aria-label="Número de meses de postergação"
                placeholder=" "
                inputMode="numeric"
                onValueChange={(value) => field.onChange(value.replace(/\D/g, ""))}
                classNames={getInputClassNames(Boolean(errors.paymentPostpaidMonths))}
                isInvalid={Boolean(errors.paymentPostpaidMonths)}
              />
            </FieldGroup>
          )}
        />
      )}

      {showProfitCenterFields && (
        <>
          <Controller
            name="profitCenter"
            control={control}
            render={({ field }) => (
              <FieldGroup label="Centro de lucro" error={errors.profitCenter?.message}>
                <Select
                  aria-label="Centro de lucro"
                  placeholder=" "
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) =>
                    field.onChange(Array.from(keys)[0]?.toString() ?? "")
                  }
                  classNames={getSelectClassNames(Boolean(errors.profitCenter))}
                  isInvalid={Boolean(errors.profitCenter)}
                >
                  {profitCenterOptions.map((item) => (
                    <SelectItem key={item.value}>{item.label}</SelectItem>
                  ))}
                </Select>
              </FieldGroup>
            )}
          />

          <Controller
            name="overflowProfitCenter"
            control={control}
            render={({ field }) => (
              <FieldGroup label="Centro de lucro (excedente)">
                <Select
                  aria-label="Centro de lucro (excedente)"
                  placeholder=" "
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) =>
                    field.onChange(Array.from(keys)[0]?.toString() ?? "")
                  }
                  classNames={paymentSelectClassNames}
                >
                  {profitCenterOptions.map((item) => (
                    <SelectItem key={item.value}>{item.label}</SelectItem>
                  ))}
                </Select>
              </FieldGroup>
            )}
          />
        </>
      )}

      <Controller
        name="paymentOnInvoiceIssueDate"
        control={control}
        render={({ field }) => (
          <Checkbox
            isSelected={field.value}
            onValueChange={field.onChange}
            classNames={{ label: "text-sm leading-6 text-gray-700" }}
            aria-label={PAYMENT_ON_ISSUE_LABEL}
          >
            {PAYMENT_ON_ISSUE_LABEL}
          </Checkbox>
        )}
      />

      <Controller
        name="paymentMethod"
        control={control}
        render={({ field }) => (
          <FieldGroup label="Método de pagamento" error={errors.paymentMethod?.message}>
            <Select
              aria-label="Método de pagamento"
              placeholder=" "
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => field.onChange(Array.from(keys)[0]?.toString() ?? "")}
              classNames={getSelectClassNames(Boolean(errors.paymentMethod))}
              isInvalid={Boolean(errors.paymentMethod)}
              isDisabled={paymentOnInvoiceIssueDate}
            >
              {paymentMethodOptions.map((item) => (
                <SelectItem key={item.value}>{item.label}</SelectItem>
              ))}
            </Select>
          </FieldGroup>
        )}
      />

      {!paymentOnInvoiceIssueDate ? (
        <Controller
          name="additionalDays"
          control={control}
          render={({ field }) => (
            <FieldGroup
              label="Prazo de pagamento da nota (Dias corridos após o mês de competência)"
              error={errors.additionalDays?.message}
            >
              <Input
                {...field}
                aria-label="Prazo de pagamento da nota (Dias corridos após o mês de competência)"
                placeholder=" "
                classNames={getInputClassNames(Boolean(errors.additionalDays))}
                isInvalid={Boolean(errors.additionalDays)}
              />
            </FieldGroup>
          )}
        />
      ) : null}

      {!paymentOnInvoiceIssueDate ? (
        <Controller
          name="dueType"
          control={control}
          render={({ field }) => (
            <FieldGroup label="Dia de vencimento">
              <Select
                aria-label="Dia de vencimento"
                selectedKeys={field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  field.onChange(Array.from(keys)[0]?.toString() ?? "");
                  setValue("dueWeekday", "");
                  setValue("dueSpecificDay", "");
                  setValue("dueDateRangeStart", "");
                  setValue("dueDateRangeEnd", "");
                }}
                classNames={paymentSelectClassNames}
              >
                {dueTypeOptions.map((option) => (
                  <SelectItem key={option.value}>{option.label}</SelectItem>
                ))}
              </Select>
            </FieldGroup>
          )}
        />
      ) : null}

      {!paymentOnInvoiceIssueDate && selectedDueType === "weekday" && (
        <Controller
          name="dueWeekday"
          control={control}
          render={({ field }) => (
            <>
              <FieldGroup label="Informe o dia da semana" error={errors.dueWeekday?.message}>
                <Select
                  aria-label="Informe o dia da semana"
                  placeholder=" "
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => field.onChange(Array.from(keys)[0]?.toString() ?? "")}
                  classNames={getSelectClassNames(Boolean(errors.dueWeekday))}
                  isInvalid={Boolean(errors.dueWeekday)}
                >
                  {weekdayOptions.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  ))}
                </Select>
              </FieldGroup>
              <div
                data-testid="due-weekday-info"
                className="rounded-md bg-sky-100 px-4 py-3 text-sm leading-6 text-zinc-800"
              >
                O vencimento da nota será na primeira ocorrência do dia informado a partir dos dias
                corridos no campo “Prazo de pagamento”, podendo o dia do prazo coincidir com o dia da
                semana informado acima
              </div>
            </>
          )}
        />
      )}

      {!paymentOnInvoiceIssueDate && selectedDueType === "specific_day" && (
        <Controller
          name="dueSpecificDay"
          control={control}
          render={({ field }) => (
            <>
              <FieldGroup label="Informe o dia do mês" error={errors.dueSpecificDay?.message}>
                <Input
                  {...field}
                  aria-label="Informe o dia do mês"
                  placeholder=" "
                  inputMode="numeric"
                  onChange={(event) =>
                    field.onChange(event.target.value.replace(/\D/g, "").slice(0, 2))
                  }
                  onValueChange={(value) => field.onChange(value.replace(/\D/g, "").slice(0, 2))}
                  classNames={getInputClassNames(Boolean(errors.dueSpecificDay))}
                  isInvalid={Boolean(errors.dueSpecificDay)}
                />
              </FieldGroup>
              <div
                data-testid="due-specific-day-info"
                className="rounded-md bg-sky-100 px-4 py-3 text-sm leading-6 text-zinc-800"
              >
                O vencimento da nota será na primeira ocorrência do dia informado a partir dos dias
                corridos no campo “Prazo de pagamento”, podendo o dia do prazo coincidir com o dia do
                mês informado acima
              </div>
            </>
          )}
        />
      )}

      <div className="flex flex-col gap-4 pt-2">
        <Controller
          name="addClientConsumptionInfo"
          control={control}
          render={({ field }) => (
            <Checkbox
              isSelected={field.value}
              onValueChange={field.onChange}
              classNames={{ label: "text-sm leading-6 text-gray-700" }}
            >
              Adicionar informação de consumo do cliente na nota fiscal
            </Checkbox>
          )}
        />
        <Controller
          name="addBankInfo"
          control={control}
          render={({ field }) => (
            <Checkbox
              isSelected={field.value}
              onValueChange={field.onChange}
              classNames={{ label: "text-sm leading-6 text-gray-700" }}
            >
              Adicionar as informações de pagamento dos dados bancários na nota fiscal
            </Checkbox>
          )}
        />
        <Controller
          name="addOrderNote"
          control={control}
          render={({ field }) => (
            <Checkbox
              isSelected={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                if (!value) {
                  setValue("orderNote", "", { shouldValidate: true });
                }
              }}
              classNames={{ label: "text-sm leading-6 text-gray-700" }}
            >
              Adicionar observação (ordem de pedido)
            </Checkbox>
          )}
        />
      </div>

      {showOrderNote && (
        <Controller
          name="orderNote"
          control={control}
          render={({ field }) => (
            <FieldGroup label="Observação" error={errors.orderNote?.message}>
              <Input
                {...field}
                aria-label="Observação"
                placeholder=" "
                classNames={getInputClassNames(Boolean(errors.orderNote))}
                isInvalid={Boolean(errors.orderNote)}
              />
            </FieldGroup>
          )}
        />
      )}
    </form>
  );
}
