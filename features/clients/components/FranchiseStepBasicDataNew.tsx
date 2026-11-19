"use client";

/**
 * Passo de dados básicos no wizard de criação de franquia.
 */

import {
  defaultCheckboxClassNames,
  defaultInputClassNames,
  defaultSelectClassNames,
} from "@/shared/styles/inputClassNames";
import { Checkbox, DatePicker, Input, Select, SelectItem, Textarea, Tooltip } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import type { CreateDeductibleRequest } from "../types/deductibles.types";
import { toCalendarDate, validateFranchiseTermOrder } from "../utils/franchiseTermBounds.utils";
import { requiredMessage } from "../utils/paymentInfoFormValidation.utils";
import {
  DEFAULT_TEST_PERIOD_MONTHS,
  isValidTestPeriodMonths,
} from "../utils/testPeriodMonths.utils";
import type { ProfitCenterSelectOption } from "./PaymentInfoForm";
import {
  FranchiseBasicProductFields,
  type FranchiseBasicProductFieldsHandle,
} from "./FranchiseBasicProductFields";

const TEST_PERIOD_LABEL = "Período da franquia (mensal = 1 | anual = 12)";
const PROFIT_CENTER_LABEL = "Centro de lucro";
const OVERAGE_PROFIT_CENTER_LABEL = "Centro de lucro excedente (opcional)";

/**
 * Estado local dos centros de lucro no step Dados básicos.
 */
export interface FranchiseBasicProfitCenterState {
  profitCenterId: string;
  overageProfitCenterId: string;
}

const EMPTY_PROFIT_CENTER_STATE: FranchiseBasicProfitCenterState = {
  profitCenterId: "",
  overageProfitCenterId: "",
};

const franchiseBaseSchema = z.object({
  name: z.string().min(1, "O nome da franquia é obrigatório"),
  description: z.string().optional(),
  beginningTerm: z.string().min(1, "A vigência inicial é obrigatória"),
  endTerm: z.string().min(1, "A vigência final é obrigatória"),
  isActive: z.boolean(),
  isTest: z.boolean(),
  automaticRenovation: z.boolean(),
  proofExpiration: z.number().int("Informe um número inteiro").min(1, "Informe um valor válido"),
  testPeriodMonths: z.number().int().nullable().optional(),
  profitCenterId: z.string(),
  overageProfitCenterId: z.string(),
});

const franchiseSchema = franchiseBaseSchema.superRefine((data, ctx) => {
  if (!isValidTestPeriodMonths(data.testPeriodMonths, data.isTest)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe um período válido (1 a 12)",
      path: ["testPeriodMonths"],
    });
  }

  if (!data.isTest && !data.profitCenterId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: requiredMessage,
      path: ["profitCenterId"],
    });
  }

  if (!data.beginningTerm || !data.endTerm) return;

  for (const error of validateFranchiseTermOrder(data)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: error.message,
      path: [error.path],
    });
  }
});

type FranchiseFormData = z.infer<typeof franchiseBaseSchema>;

/**
 * Handle imperativo do passo de dados básicos.
 */
export interface FranchiseStepBasicDataNewHandle {
  flushToParent: () => Promise<boolean>;
}

interface FranchiseStepBasicDataNewProps {
  state: CreateDeductibleRequest;
  onStateChange: (next: Partial<CreateDeductibleRequest>) => void;
  isEdit?: boolean;
  resetKey: string;
  clientIsTest?: boolean;
  profitCenterOptions?: ProfitCenterSelectOption[];
  profitCenterState?: FranchiseBasicProfitCenterState;
  onProfitCenterChange?: (next: FranchiseBasicProfitCenterState) => void;
  isLoadingProfitCenters?: boolean;
  canListProducts?: boolean;
}

/**
 * Passo de dados básicos na nova franquia.
 */
export const FranchiseStepBasicDataNew = forwardRef<
  FranchiseStepBasicDataNewHandle,
  FranchiseStepBasicDataNewProps
>(function FranchiseStepBasicDataNew(
  {
    state,
    onStateChange,
    isEdit,
    resetKey,
    clientIsTest = false,
    profitCenterOptions = [],
    profitCenterState = EMPTY_PROFIT_CENTER_STATE,
    onProfitCenterChange,
    isLoadingProfitCenters = false,
    canListProducts = true,
  },
  ref,
) {
  const productFieldsRef = useRef<FranchiseBasicProductFieldsHandle>(null);
  const resolver = useMemo(() => zodResolver(franchiseSchema), []);
  const profitCenterStateRef = useRef(profitCenterState);
  profitCenterStateRef.current = profitCenterState;

  const {
    control,
    setValue,
    getValues,
    trigger,
    reset,
    formState: { errors },
  } = useForm<FranchiseFormData>({
    resolver,
    defaultValues: toFormValues(state, profitCenterState),
    mode: "onTouched",
    reValidateMode: "onBlur",
  });

  const isActive = useWatch({ control, name: "isActive" });
  const automaticRenovation = useWatch({ control, name: "automaticRenovation" });
  const [proofExpirationInput, setProofExpirationInput] = useState(
    String(state.proofExpiration ?? 1),
  );
  const [testPeriodMonthsInput, setTestPeriodMonthsInput] = useState(
    state.testPeriodMonths !== null && state.testPeriodMonths !== undefined
      ? String(state.testPeriodMonths)
      : "",
  );
  const isTestFranchise = state.isTest ?? false;
  const showAutomaticRenovation = !(isEdit && isTestFranchise);
  const showProfitCenterFields = !isTestFranchise;
  const stateRef = useRef(state);
  stateRef.current = state;
  const onProfitCenterChangeRef = useRef(onProfitCenterChange);
  onProfitCenterChangeRef.current = onProfitCenterChange;

  const clearProfitCenterFields = useCallback(() => {
    setValue("profitCenterId", "");
    setValue("overageProfitCenterId", "");
    onProfitCenterChangeRef.current?.(EMPTY_PROFIT_CENTER_STATE);
  }, [setValue]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: resetKey re-sincroniza o form ao reabrir o drawer
  useEffect(() => {
    reset(toFormValues(stateRef.current, profitCenterStateRef.current));
    setProofExpirationInput(String(stateRef.current.proofExpiration ?? 1));
    setTestPeriodMonthsInput(
      stateRef.current.testPeriodMonths !== null && stateRef.current.testPeriodMonths !== undefined
        ? String(stateRef.current.testPeriodMonths)
        : "",
    );
  }, [resetKey, reset]);

  useEffect(() => {
    setValue("isTest", isTestFranchise);
    if (isTestFranchise) {
      const current = stateRef.current.testPeriodMonths;
      const next =
        current !== null && current !== undefined && isValidTestPeriodMonths(current, true)
          ? current
          : DEFAULT_TEST_PERIOD_MONTHS;
      setValue("testPeriodMonths", next);
      setTestPeriodMonthsInput(String(next));
      clearProfitCenterFields();
    } else {
      setValue("testPeriodMonths", null);
      setTestPeriodMonthsInput("");
    }
  }, [isTestFranchise, setValue, clearProfitCenterFields]);

  useEffect(() => {
    setValue("profitCenterId", profitCenterState.profitCenterId);
    setValue("overageProfitCenterId", profitCenterState.overageProfitCenterId);
  }, [profitCenterState.profitCenterId, profitCenterState.overageProfitCenterId, setValue]);

  const commitProofExpiration = useCallback(
    (input: string) => {
      const parsed = Number.parseInt(input, 10);
      const next = input === "" || Number.isNaN(parsed) ? 0 : parsed;
      setValue("proofExpiration", next, { shouldValidate: false });
      return next;
    },
    [setValue],
  );

  const commitTestPeriodMonths = useCallback(
    (input: string) => {
      if (input === "") {
        setValue("testPeriodMonths", null, { shouldValidate: false });
        return null;
      }
      const parsed = Number.parseInt(input, 10);
      const next = Number.isNaN(parsed) ? null : parsed;
      setValue("testPeriodMonths", next, { shouldValidate: false });
      return next;
    },
    [setValue],
  );

  const emitProfitCenter = useCallback((next: FranchiseBasicProfitCenterState) => {
    onProfitCenterChangeRef.current?.(next);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      flushToParent: async () => {
        const productsValid = productFieldsRef.current?.validate() ?? true;
        if (!productsValid) return false;

        commitProofExpiration(proofExpirationInput);
        commitTestPeriodMonths(testPeriodMonthsInput);
        const values = getValues();
        const isTest = stateRef.current.isTest ?? values.isTest;
        onStateChange({
          name: values.name,
          description: values.description,
          beginningTerm: values.beginningTerm,
          endTerm: values.endTerm,
          isActive: values.isActive,
          isTest,
          automaticRenovation: values.automaticRenovation,
          proofExpiration: values.proofExpiration,
          testPeriodMonths: isTest ? (values.testPeriodMonths ?? null) : null,
        });
        emitProfitCenter({
          profitCenterId: isTest ? "" : values.profitCenterId,
          overageProfitCenterId: isTest ? "" : values.overageProfitCenterId,
        });
        const formValid = await trigger();
        return formValid;
      },
    }),
    [
      getValues,
      onStateChange,
      trigger,
      proofExpirationInput,
      testPeriodMonthsInput,
      commitProofExpiration,
      commitTestPeriodMonths,
      emitProfitCenter,
    ],
  );

  const getErrorClassNames = (isError: boolean) => ({
    ...defaultInputClassNames,
    inputWrapper: isError
      ? `${defaultInputClassNames.inputWrapper} !border-danger-500 !border-2`
      : defaultInputClassNames.inputWrapper,
  });

  const getSelectClassNames = (isError: boolean) => ({
    ...defaultSelectClassNames,
    value: "text-gray-700! text-sm",
    trigger: isError
      ? `${defaultSelectClassNames.trigger} !border-danger-500 !border-2`
      : defaultSelectClassNames.trigger,
  });

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-default-500">Dados básicos</h3>

      <div className="flex flex-col gap-3 pt-1">
        <Checkbox
          classNames={defaultCheckboxClassNames}
          isSelected={isActive}
          onValueChange={(value) => {
            setValue("isActive", value);
            onStateChange({ isActive: value });
          }}
        >
          Franquia ativa
        </Checkbox>
        {!isEdit &&
          (clientIsTest ? (
            <Tooltip
              content="Clientes de teste só podem ter franquias de teste"
              placement="top-start"
              showArrow
            >
              <div className="w-fit">
                <Checkbox classNames={defaultCheckboxClassNames} isSelected={isTestFranchise} isDisabled>
                  Franquia de teste
                </Checkbox>
              </div>
            </Tooltip>
          ) : (
            <Checkbox
              classNames={defaultCheckboxClassNames}
              isSelected={isTestFranchise}
              onValueChange={(value) => {
                setValue("isTest", value);
                if (value) {
                  setValue("automaticRenovation", false);
                  setValue("testPeriodMonths", DEFAULT_TEST_PERIOD_MONTHS);
                  setTestPeriodMonthsInput(String(DEFAULT_TEST_PERIOD_MONTHS));
                  clearProfitCenterFields();
                  onStateChange({
                    isTest: true,
                    automaticRenovation: false,
                    testPeriodMonths: DEFAULT_TEST_PERIOD_MONTHS,
                  });
                  return;
                }
                setValue("testPeriodMonths", null);
                setTestPeriodMonthsInput("");
                onStateChange({ isTest: false, testPeriodMonths: null });
              }}
            >
              Franquia de teste
            </Checkbox>
          ))}
        {showAutomaticRenovation && (
          <Checkbox
            classNames={defaultCheckboxClassNames}
            isSelected={automaticRenovation}
            onValueChange={(value) => {
              setValue("automaticRenovation", value);
              onStateChange({ automaticRenovation: value });
            }}
            isDisabled={!isEdit && isTestFranchise}
          >
            Renovação automática
          </Checkbox>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm text-default-500">Nome da franquia <span className="text-danger">*</span></p>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              aria-label="Nome da franquia"
              placeholder="Ex: Franquia Padrão"
              classNames={getErrorClassNames(Boolean(errors.name))}
              isInvalid={Boolean(errors.name)}
              errorMessage={errors.name?.message}
              onBlur={() => {
                field.onBlur();
                void trigger("name");
                onStateChange({ name: field.value });
              }}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-default-500">Descrição</p>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              aria-label="Descrição"
              placeholder="Breve descrição da franquia"
              classNames={defaultInputClassNames}
              onBlur={() => {
                field.onBlur();
                onStateChange({ description: field.value });
              }}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="beginningTerm"
            control={control}
            render={({ field }) => (
              <DatePicker
                label={<span>Vigência inicial <span className="text-danger">*</span></span>}
                labelPlacement="outside"
                value={toCalendarDate(field.value) as never}
                onChange={(date: { toString(): string } | null) => {
                  const val = date?.toString() ?? "";
                  const nextBeginningTerm = val ? `${val}T00:00:00Z` : "";
                  field.onChange(nextBeginningTerm);
                  onStateChange({ beginningTerm: nextBeginningTerm });

                  if (errors.beginningTerm || errors.endTerm) {
                    void trigger(["beginningTerm", "endTerm"]);
                  }
                }}
                onBlur={() => {
                  const endVal = getValues("endTerm");
                  if (field.value && endVal) {
                    void trigger(["beginningTerm", "endTerm"]);
                  }
                }}
                classNames={getErrorClassNames(Boolean(errors.beginningTerm))}
                isInvalid={Boolean(errors.beginningTerm)}
                errorMessage={errors.beginningTerm?.message}
              />
            )}
          />

          <Controller
            name="endTerm"
            control={control}
            render={({ field }) => (
              <DatePicker
                label={<span>Vigência final <span className="text-danger">*</span></span>}
                labelPlacement="outside"
                value={toCalendarDate(field.value) as never}
                onChange={(date: { toString(): string } | null) => {
                  const val = date?.toString() ?? "";
                  const nextEndTerm = val ? `${val}T23:59:59Z` : "";
                  field.onChange(nextEndTerm);
                  onStateChange({ endTerm: nextEndTerm });

                  if (errors.beginningTerm || errors.endTerm) {
                    void trigger(["beginningTerm", "endTerm"]);
                  }
                }}
                onBlur={() => {
                  const startVal = getValues("beginningTerm");
                  if (field.value && startVal) {
                    void trigger(["beginningTerm", "endTerm"]);
                  }
                }}
                classNames={getErrorClassNames(Boolean(errors.endTerm))}
                isInvalid={Boolean(errors.endTerm)}
                errorMessage={errors.endTerm?.message}
              />
            )}
          />
        </div>
      </div>

      <FranchiseBasicProductFields
        ref={productFieldsRef}
        state={state}
        onStateChange={onStateChange}
        canListProducts={canListProducts}
        getSelectClassNames={getSelectClassNames}
      />

      <div className="space-y-2">
        <p className="text-sm text-default-500">Expiração do comprovante (dias) <span className="text-danger">*</span></p>
        <Controller
          name="proofExpiration"
          control={control}
          render={({ field: { onChange, onBlur, ref: inputRef } }) => (
            <Input
              ref={inputRef}
              type="number"
              min={1}
              aria-label="Expiração do comprovante (dias)"
              value={proofExpirationInput}
              onValueChange={(v) => {
                setProofExpirationInput(v);
                if (v === "") return;
                const parsed = Number.parseInt(v, 10);
                if (!Number.isNaN(parsed)) onChange(parsed);
              }}
              classNames={getErrorClassNames(Boolean(errors.proofExpiration))}
              isInvalid={Boolean(errors.proofExpiration)}
              errorMessage={errors.proofExpiration?.message}
              onBlur={() => {
                const next = commitProofExpiration(proofExpirationInput);
                onChange(next);
                if (next >= 1) setProofExpirationInput(String(next));
                onBlur();
                void trigger("proofExpiration");
                onStateChange({ proofExpiration: getValues("proofExpiration") });
              }}
            />
          )}
        />
      </div>

      {showProfitCenterFields && (
        <>
          <div className="space-y-2">
            <p className="text-sm text-default-500">
              {PROFIT_CENTER_LABEL} <span className="text-danger">*</span>
            </p>
            <Controller
              name="profitCenterId"
              control={control}
              render={({ field }) => (
                <Select
                  aria-label={PROFIT_CENTER_LABEL}
                  placeholder="Selecione uma opção"
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const nextId = Array.from(keys)[0]?.toString() ?? "";
                    field.onChange(nextId);
                    emitProfitCenter({
                      profitCenterId: nextId,
                      overageProfitCenterId: getValues("overageProfitCenterId"),
                    });
                    void trigger("profitCenterId");
                  }}
                  classNames={getSelectClassNames(Boolean(errors.profitCenterId))}
                  isInvalid={Boolean(errors.profitCenterId)}
                  errorMessage={errors.profitCenterId?.message}
                  isLoading={isLoadingProfitCenters}
                  isDisabled={isLoadingProfitCenters}
                >
                  {profitCenterOptions.map((item) => (
                    <SelectItem key={item.value}>{item.label}</SelectItem>
                  ))}
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-default-500">{OVERAGE_PROFIT_CENTER_LABEL}</p>
            <Controller
              name="overageProfitCenterId"
              control={control}
              render={({ field }) => (
                <Select
                  aria-label={OVERAGE_PROFIT_CENTER_LABEL}
                  placeholder="Selecione uma opção"
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const nextId = Array.from(keys)[0]?.toString() ?? "";
                    field.onChange(nextId);
                    emitProfitCenter({
                      profitCenterId: getValues("profitCenterId"),
                      overageProfitCenterId: nextId,
                    });
                  }}
                  classNames={getSelectClassNames(false)}
                  isLoading={isLoadingProfitCenters}
                  isDisabled={isLoadingProfitCenters}
                >
                  {profitCenterOptions.map((item) => (
                    <SelectItem key={item.value}>{item.label}</SelectItem>
                  ))}
                </Select>
              )}
            />
          </div>
        </>
      )}

      {isTestFranchise && (
        <div className="space-y-2">
          <p className="text-sm text-default-500">{TEST_PERIOD_LABEL}</p>
          <Controller
            name="testPeriodMonths"
            control={control}
            render={({ field: { onChange, onBlur, ref: inputRef } }) => (
              <Input
                ref={inputRef}
                type="number"
                min={1}
                max={12}
                aria-label={TEST_PERIOD_LABEL}
                value={testPeriodMonthsInput}
                onValueChange={(v) => {
                  setTestPeriodMonthsInput(v);
                  if (v === "") {
                    onChange(null);
                    return;
                  }
                  const parsed = Number.parseInt(v, 10);
                  if (!Number.isNaN(parsed)) onChange(parsed);
                }}
                classNames={getErrorClassNames(Boolean(errors.testPeriodMonths))}
                isInvalid={Boolean(errors.testPeriodMonths)}
                errorMessage={errors.testPeriodMonths?.message}
                onBlur={() => {
                  const next = commitTestPeriodMonths(testPeriodMonthsInput);
                  onChange(next);
                  if (next !== null && next !== undefined && isValidTestPeriodMonths(next, true)) {
                    setTestPeriodMonthsInput(String(next));
                  }
                  onBlur();
                  void trigger("testPeriodMonths");
                  onStateChange({ testPeriodMonths: next });
                }}
              />
            )}
          />
        </div>
      )}
    </div>
  );
});

function toFormValues(
  state: CreateDeductibleRequest,
  profitCenterState: FranchiseBasicProfitCenterState,
): FranchiseFormData {
  return {
    name: state.name ?? "",
    description: state.description ?? "",
    beginningTerm: state.beginningTerm ?? "",
    endTerm: state.endTerm ?? "",
    isActive: state.isActive ?? true,
    isTest: state.isTest ?? false,
    automaticRenovation: state.automaticRenovation ?? true,
    proofExpiration: state.proofExpiration ?? 1,
    testPeriodMonths: state.isTest ? (state.testPeriodMonths ?? DEFAULT_TEST_PERIOD_MONTHS) : null,
    profitCenterId: state.isTest ? "" : (profitCenterState.profitCenterId ?? ""),
    overageProfitCenterId: state.isTest ? "" : (profitCenterState.overageProfitCenterId ?? ""),
  };
}
