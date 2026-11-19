"use client";

/**
 * Passo de modelo de cobrança no wizard de criação de franquia.
 */

import { useDebouncedCallback } from "@/shared/hooks/useDebouncedCallback";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import {
  hasExactlyFourDecimalPlaces,
  maskCurrency4,
  unmaskCurrency4,
} from "@/shared/utils/currency";
import { Button, Checkbox, Input, Radio, RadioGroup, Spinner, Tooltip } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlus, Trash2 } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { useBillingModels } from "../hooks/useBillingModels";
import type {
  BillingModelOption,
  CreateDeductibleRequest,
  DeductibleBillingModel,
  PriceRange,
} from "../types/deductibles.types";
import {
  findBillingModelOption,
  getFixedPriceIncludedConsultations,
  getPriceRangeUnitPriceLabel,
  includesBillingSection,
  isFixedPriceOnlyOption,
  isMinimumContractBillingModel,
  mapFixedPriceToFormValues,
  mapFormFixedPriceToState,
  mapFormFixedPriceToStoredState,
} from "../utils/billingModel.utils";
import {
  closeLastRangeForAppend,
  createDefaultRange,
  getFirstRangeMin,
  getNextRangeMin,
  normalizePriceRanges,
  validateChainedPriceRanges,
} from "../utils/priceRangeChain.utils";

const priceRangeSchema = z.object({
  minConsultations: z.number().min(1, "Mínimo deve ser maior que 0"),
  maxConsultations: z.number().min(1, "Máximo deve ser maior que 0").nullable(),
  unitPrice: z.number().min(0, "Preço unitário inválido"),
});

const billingSchema = z.object({
  billingModel: z.string().min(1, "Selecione um modelo de cobrança"),
  automaticBlocking: z.boolean(),
  excessUnitPrice: z.number().min(0).nullable(),
  fixedPrice: z
    .object({
      includedConsultations: z.number().min(1, "Informe pelo menos 1 consulta").optional(),
      packagePrice: z.number().min(0).optional(),
    })
    .optional(),
  priceRanges: z.array(priceRangeSchema).optional(),
});

function createBillingSchema(billingModels: BillingModelOption[]) {
  return billingSchema.superRefine((data, ctx) => {
    const option = findBillingModelOption(data.billingModel, billingModels);
    const excess = data.excessUnitPrice ?? 0;
    const hasFixedPrice = includesBillingSection(option, "fixedPrice");
    const hasPriceRanges = includesBillingSection(option, "priceRanges");
    const includedConsultations = data.fixedPrice?.includedConsultations ?? 0;

    if (hasFixedPrice) {
      if (includedConsultations < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe pelo menos 1 consulta",
          path: ["fixedPrice", "includedConsultations"],
        });
      }
      if (data.fixedPrice?.packagePrice === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o preço do pacote",
          path: ["fixedPrice", "packagePrice"],
        });
      }
    }

    // excessUnitPrice só é exigido no modelo fixed_price
    if (isFixedPriceOnlyOption(option) && !data.automaticBlocking && excess <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o preço excedente ou ative o bloqueio automático",
        path: ["excessUnitPrice"],
      });
    }

    if (!hasPriceRanges || !data.priceRanges?.length) return;

    if (!validateChainedPriceRanges(data.priceRanges, hasFixedPrice, includedConsultations)) {
      const lastIndex = data.priceRanges.length - 1;
      for (let i = 0; i < data.priceRanges.length; i += 1) {
        const range = data.priceRanges[i];
        if (i === lastIndex) {
          if (range.maxConsultations !== null) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "A última faixa deve ter máximo ilimitado",
              path: ["priceRanges", i, "maxConsultations"],
            });
          }
          continue;
        }
        if (
          range.maxConsultations === null ||
          range.maxConsultations === undefined ||
          range.maxConsultations <= range.minConsultations
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "O máximo deve ser maior que o mínimo",
            path: ["priceRanges", i, "maxConsultations"],
          });
        }
      }
    }
  });
}

type BillingFormData = z.infer<typeof billingSchema>;

const FOUR_DECIMAL_PRECISION_MESSAGE = "Informe o valor com exatamente 4 casas decimais";

type CommercialCurrencyInputProps = {
  value: number | undefined;
  onChange: (value: number) => void;
  onBlur: () => void;
  classNames?: typeof defaultInputClassNames;
  isInvalid?: boolean;
  errorMessage?: string;
  onPrecisionError?: (message: string | undefined) => void;
};

function CommercialCurrencyInput({
  value,
  onChange,
  onBlur,
  classNames = defaultInputClassNames,
  isInvalid,
  errorMessage,
  onPrecisionError,
}: CommercialCurrencyInputProps) {
  const [precisionMessage, setPrecisionMessage] = useState<string>();

  return (
    <Input
      value={maskCurrency4(value ?? 0)}
      onValueChange={(val) => {
        onChange(unmaskCurrency4(val));
        setPrecisionMessage(undefined);
        onPrecisionError?.(undefined);
      }}
      onBlur={() => {
        // Validar a máscara canônica (sempre 4 casas), não o texto bruto do onValueChange
        // (ex.: "50" / "101050"), que gerava falso positivo no blur.
        const displayed = maskCurrency4(value ?? 0);
        const numericValue = value ?? 0;
        const lacksPrecision = numericValue > 0 && !hasExactlyFourDecimalPlaces(displayed);
        const message = lacksPrecision ? FOUR_DECIMAL_PRECISION_MESSAGE : undefined;
        setPrecisionMessage(message);
        onPrecisionError?.(message);
        onBlur();
      }}
      classNames={classNames}
      isInvalid={isInvalid || Boolean(precisionMessage)}
      errorMessage={precisionMessage ?? errorMessage}
    />
  );
}

type RechainSource = { type: "included" } | { type: "max"; index: number };

type RechainContext = {
  skipMaxIndex?: number;
  syncParent: boolean;
};

interface FranchiseStepBillingNewProps {
  state: CreateDeductibleRequest;
  onStateChange: (next: Partial<CreateDeductibleRequest>) => void;
  contractMinimumValue: number;
}

export interface FranchiseStepBillingNewHandle {
  validate: () => Promise<boolean>;
}

/**
 * Passo de cobrança na nova franquia.
 */
export const FranchiseStepBillingNew = forwardRef<
  FranchiseStepBillingNewHandle,
  FranchiseStepBillingNewProps
>(function FranchiseStepBillingNew({
  state,
  onStateChange,
  contractMinimumValue,
}: FranchiseStepBillingNewProps, ref) {
  const { data: billingModels = [], isLoading: isLoadingBillingModels } = useBillingModels();

  const billingSchemaWithExcess = useMemo(
    () => createBillingSchema(billingModels),
    [billingModels],
  );

  const formValues = useMemo(() => {
    return {
      billingModel: state.billingModel ?? "fixed_price",
      automaticBlocking: state.automaticBlocking ?? false,
      excessUnitPrice: state.excessUnitPrice ?? null,
      fixedPrice: mapFixedPriceToFormValues(state.fixedPrice),
      priceRanges: state.priceRanges ?? [],
    };
  }, [
    state.billingModel,
    state.automaticBlocking,
    state.excessUnitPrice,
    state.fixedPrice,
    state.priceRanges,
  ]);

  const {
    control,
    watch,
    getValues,
    setValue,
    trigger,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<BillingFormData>({
    resolver: zodResolver(billingSchemaWithExcess),
    values: formValues,
    resetOptions: { keepDirtyValues: true },
  });

  useImperativeHandle(
    ref,
    () => ({
      validate: () => trigger(),
    }),
    [trigger],
  );

  const { fields, append, remove } = useFieldArray({
    control,
    name: "priceRanges",
  });

  const syncWithParent = useCallback(() => {
    const values = getValues();
    const selectedOption = findBillingModelOption(values.billingModel, billingModels);
    const isFixedOnly = isFixedPriceOnlyOption(selectedOption);
    const hasFixedPrice = includesBillingSection(selectedOption, "fixedPrice");
    const hasPriceRanges = includesBillingSection(selectedOption, "priceRanges");
    const included = values.fixedPrice?.includedConsultations ?? 1;
    const priceRanges =
      hasPriceRanges && values.priceRanges?.length
        ? normalizePriceRanges(values.priceRanges, hasFixedPrice, included)
        : values.priceRanges;

    onStateChange({
      billingModel: values.billingModel as DeductibleBillingModel,
      automaticBlocking: values.automaticBlocking,
      excessUnitPrice: isFixedOnly ? (values.excessUnitPrice ?? 0) : null,
      fixedPrice: hasFixedPrice
        ? mapFormFixedPriceToState(values.fixedPrice, selectedOption)
        : state.fixedPrice,
      priceRanges,
    });
  }, [billingModels, getValues, onStateChange, state.fixedPrice]);

  const watchedValues = watch();

  const isModelDisabled = contractMinimumValue > 0 && !state.isTest;
  const tooltipContent = (
    <p className="max-w-xs text-sm leading-snug whitespace-normal">
      Contratos com valor mínimo somente podem conter franquias por faixa de valor, com exceção de
      franquias de teste
    </p>
  );

  const { billingModel } = watchedValues;
  const selectedOption = findBillingModelOption(billingModel, billingModels);
  const showFixedPrice = includesBillingSection(selectedOption, "fixedPrice");
  const showPriceRanges = includesBillingSection(selectedOption, "priceRanges");
  const isFixedPriceOnly = isFixedPriceOnlyOption(selectedOption);
  const showAutomaticBlocking = isFixedPriceOnly;
  const showExcessPrice = isFixedPriceOnly && !watchedValues.automaticBlocking;

  const rechainContextRef = useRef<RechainContext>({ syncParent: true });
  const [rechainSource, setRechainSource] = useState<RechainSource | null>(null);

  const applyNormalizedRanges = useCallback(
    (normalized: PriceRange[], options?: { skipMaxIndex?: number; syncParent?: boolean }) => {
      const current = getValues("priceRanges") ?? [];
      const skipMaxIndex = options?.skipMaxIndex;
      const syncParent = options?.syncParent !== false;

      normalized.forEach((range, i) => {
        if (range.minConsultations !== current[i]?.minConsultations) {
          setValue(`priceRanges.${i}.minConsultations`, range.minConsultations);
        }
        if (i !== skipMaxIndex && range.maxConsultations !== current[i]?.maxConsultations) {
          setValue(`priceRanges.${i}.maxConsultations`, range.maxConsultations);
        }
      });

      if (syncParent) {
        onStateChange({ priceRanges: getValues("priceRanges") ?? [] });
      }
    },
    [getValues, setValue, onStateChange],
  );

  const rechainAndApply = useCallback(() => {
    const ctx = rechainContextRef.current;
    const values = getValues();
    const included = values.fixedPrice?.includedConsultations ?? 1;
    const currentRanges = values.priceRanges ?? [];
    const normalized =
      currentRanges.length === 0
        ? [createDefaultRange(getFirstRangeMin(showFixedPrice, included))]
        : normalizePriceRanges(currentRanges, showFixedPrice, included);

    if (currentRanges.length === 0) {
      setValue("priceRanges", normalized);
      if (ctx.syncParent) {
        onStateChange({ priceRanges: normalized });
      }
      return;
    }

    applyNormalizedRanges(normalized, {
      skipMaxIndex: ctx.skipMaxIndex,
      syncParent: ctx.syncParent,
    });
  }, [getValues, setValue, onStateChange, showFixedPrice, applyNormalizedRanges]);

  const {
    debounced: debouncedRechain,
    flush: flushRechain,
    isPending: isRechainPending,
  } = useDebouncedCallback(rechainAndApply, 1500);

  useEffect(() => {
    if (!isRechainPending) {
      setRechainSource(null);
    }
  }, [isRechainPending]);

  const shouldShowMinLoading = useCallback(
    (index: number) => {
      if (!isRechainPending || !rechainSource) return false;
      if (rechainSource.type === "included") return true;
      return index > rechainSource.index;
    },
    [isRechainPending, rechainSource],
  );

  const scheduleIncludedRechain = useCallback(() => {
    rechainContextRef.current = { syncParent: false };
    setRechainSource({ type: "included" });
    debouncedRechain();
  }, [debouncedRechain]);

  const scheduleMaxRechain = useCallback(
    (index: number) => {
      rechainContextRef.current = { skipMaxIndex: index, syncParent: false };
      setRechainSource({ type: "max", index });
      debouncedRechain();
    },
    [debouncedRechain],
  );

  const flushRechainWithSync = useCallback(() => {
    rechainContextRef.current = { syncParent: true };
    flushRechain();
  }, [flushRechain]);

  const rechainImmediate = useCallback(() => {
    rechainContextRef.current = { syncParent: true };
    rechainAndApply();
  }, [rechainAndApply]);

  useEffect(() => {
    if (!showPriceRanges) return;

    const currentRanges = getValues("priceRanges") ?? [];
    if (currentRanges.length === 0) {
      rechainImmediate();
      return;
    }

    const included = getValues("fixedPrice.includedConsultations") ?? 1;
    const normalized = normalizePriceRanges(currentRanges, showFixedPrice, included);
    const needsUpdate = normalized.some(
      (range, index) =>
        range.minConsultations !== currentRanges[index]?.minConsultations ||
        range.maxConsultations !== currentRanges[index]?.maxConsultations,
    );

    if (needsUpdate) {
      applyNormalizedRanges(normalized, { syncParent: true });
    }
  }, [showPriceRanges, showFixedPrice, getValues, applyNormalizedRanges, rechainImmediate]);

  const getErrorClassNames = (isError: boolean) => ({
    ...defaultInputClassNames,
    inputWrapper: isError
      ? `${defaultInputClassNames.inputWrapper} !border-danger-500 !border-2`
      : defaultInputClassNames.inputWrapper,
  });

  if (state.isTest) {
    const includedConsultations =
      watchedValues.fixedPrice?.includedConsultations ??
      getFixedPriceIncludedConsultations(state.fixedPrice, 1);

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-medium text-default-500">Modelo de cobrança</h3>
        <div className="space-y-2">
          <p className="text-sm text-default-500 font-medium">
            Quantidade de consultas liberadas para teste
          </p>
          <Input
            type="number"
            value={String(includedConsultations)}
            onValueChange={(value) => {
              const parsed = Number(value) || 0;
              setValue("fixedPrice.includedConsultations", parsed);
              onStateChange({
                fixedPrice: {
                  includedConsultations: parsed,
                  packagePrice: 0,
                },
                excessUnitPrice: 0,
              });
            }}
            classNames={defaultInputClassNames}
            isInvalid={Boolean(errors.fixedPrice?.includedConsultations)}
            errorMessage={errors.fixedPrice?.includedConsultations?.message}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-default-500">Modelo de cobrança</h3>

      {isLoadingBillingModels ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <RadioGroup
          value={billingModel}
          onValueChange={(value) => {
            const nextOption = findBillingModelOption(value, billingModels);
            const leavingFixedPriceOnly = !isFixedPriceOnlyOption(nextOption);

            const preservedFixedPrice =
              mapFormFixedPriceToStoredState(getValues("fixedPrice")) ?? state.fixedPrice;

            setValue("billingModel", value);
            if (leavingFixedPriceOnly) {
              setValue("automaticBlocking", false);
              setValue("excessUnitPrice", null);
            }

            const nextFixedPrice = includesBillingSection(nextOption, "fixedPrice")
              ? mapFixedPriceToFormValues(preservedFixedPrice)
              : undefined;
            setValue("fixedPrice", nextFixedPrice);

            const nextShowFixedPrice = includesBillingSection(nextOption, "fixedPrice");
            const nextShowPriceRanges = includesBillingSection(nextOption, "priceRanges");
            let nextPriceRanges = getValues("priceRanges") ?? [];
            if (nextShowPriceRanges) {
              const included = nextFixedPrice?.includedConsultations ?? 1;
              const currentRanges = getValues("priceRanges") ?? [];
              nextPriceRanges =
                currentRanges.length === 0
                  ? [createDefaultRange(getFirstRangeMin(nextShowFixedPrice, included))]
                  : normalizePriceRanges(currentRanges, nextShowFixedPrice, included);
              setValue("priceRanges", nextPriceRanges);
            }

            const values = getValues();
            const nextIsFixedOnly = isFixedPriceOnlyOption(nextOption);
            onStateChange({
              billingModel: value as DeductibleBillingModel,
              automaticBlocking: leavingFixedPriceOnly ? false : values.automaticBlocking,
              excessUnitPrice: nextIsFixedOnly ? (values.excessUnitPrice ?? 0) : null,
              fixedPrice: preservedFixedPrice,
              priceRanges: nextPriceRanges,
            });
          }}
          classNames={{ wrapper: "gap-2" }}
        >
          {billingModels.map((opt) => {
            const isDisabled = isModelDisabled && !isMinimumContractBillingModel(opt.value);

            const radio = (
              <Radio
                key={opt.value}
                value={opt.value}
                isDisabled={isDisabled}
                classNames={{ label: "text-sm" }}
              >
                {opt.label}
              </Radio>
            );

            if (!isDisabled) {
              return (
                <div key={opt.value} className="w-fit">
                  {radio}
                </div>
              );
            }

            return (
              <Tooltip
                key={opt.value}
                content={tooltipContent}
                placement="top-start"
                showArrow
                classNames={{ content: "max-w-xs" }}
              >
                <div className="w-fit">{radio}</div>
              </Tooltip>
            );
          })}
        </RadioGroup>
      )}

      {showFixedPrice && (
        <div className="space-y-6">
          <h4 className="text-xl font-medium text-default-500">Configuração de Preço Fixo</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-default-500 font-medium">Consultas incluídas</p>
              <Controller
                name="fixedPrice.includedConsultations"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    min={1}
                    value={String(field.value ?? "")}
                    onValueChange={(value) => {
                      const parsed = Number(value) || 0;
                      field.onChange(parsed);
                      if (showPriceRanges) {
                        scheduleIncludedRechain();
                      }
                    }}
                    onBlur={() => {
                      field.onBlur();
                      if (showPriceRanges) {
                        flushRechainWithSync();
                      }
                      trigger("fixedPrice.includedConsultations");
                      syncWithParent();
                    }}
                    classNames={defaultInputClassNames}
                    isInvalid={Boolean(errors.fixedPrice?.includedConsultations)}
                    errorMessage={errors.fixedPrice?.includedConsultations?.message}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-default-500 font-medium">Preço do pacote</p>
              <Controller
                name="fixedPrice.packagePrice"
                control={control}
                render={({ field }) => (
                  <CommercialCurrencyInput
                    value={field.value}
                    onChange={field.onChange}
                    onPrecisionError={(message) => {
                      if (message) {
                        setError("fixedPrice.packagePrice", { message });
                      } else {
                        clearErrors("fixedPrice.packagePrice");
                      }
                    }}
                    onBlur={() => {
                      field.onBlur();
                      syncWithParent();
                    }}
                    classNames={defaultInputClassNames}
                    isInvalid={Boolean(errors.fixedPrice?.packagePrice)}
                    errorMessage={errors.fixedPrice?.packagePrice?.message}
                  />
                )}
              />
            </div>
          </div>
        </div>
      )}

      {showPriceRanges && (
        <div className="space-y-4 border-t border-default-200 pt-4">
          <h4 className="text-2xl font-medium text-default-600">Faixas de valor</h4>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-3 gap-3 items-end">
              <div className="space-y-2">
                <p className="text-sm text-default-500 font-medium">Mínimo de consultas</p>
                <div className="relative">
                  <Input
                    type="number"
                    isReadOnly
                    isDisabled
                    value={String(watchedValues.priceRanges?.[index]?.minConsultations ?? "")}
                    classNames={{
                      ...defaultInputClassNames,
                      input: shouldShowMinLoading(index)
                        ? `${defaultInputClassNames.input} text-transparent`
                        : defaultInputClassNames.input,
                    }}
                    aria-label={`Mínimo de consultas da faixa ${index + 1} (calculado automaticamente)`}
                  />
                  {shouldShowMinLoading(index) && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <Spinner
                        size="sm"
                        color="primary"
                        aria-label={`Recalculando mínimo da faixa ${index + 1}`}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-default-500 font-medium">Máximo de consultas</p>
                {index === fields.length - 1 ? (
                  <Input
                    isReadOnly
                    isDisabled
                    value="Sem limite"
                    classNames={defaultInputClassNames}
                    aria-label={`Máximo de consultas da faixa ${index + 1} (ilimitado)`}
                  />
                ) : (
                  <Controller
                    name={`priceRanges.${index}.maxConsultations`}
                    control={control}
                    render={({ field: maxField }) => (
                      <Input
                        type="number"
                        value={String(maxField.value ?? "")}
                        onValueChange={(value) => {
                          const parsed = Number(value) || 0;
                          maxField.onChange(parsed);
                          scheduleMaxRechain(index);
                        }}
                        onBlur={() => {
                          maxField.onBlur();
                          flushRechainWithSync();
                          trigger(`priceRanges.${index}.maxConsultations`);
                          syncWithParent();
                        }}
                        classNames={getErrorClassNames(
                          Boolean(errors.priceRanges?.[index]?.maxConsultations),
                        )}
                        isInvalid={Boolean(errors.priceRanges?.[index]?.maxConsultations)}
                        errorMessage={errors.priceRanges?.[index]?.maxConsultations?.message}
                      />
                    )}
                  />
                )}
              </div>
              <div className="flex items-end gap-2">
                <div className="space-y-2 w-full">
                  <p className="text-sm text-default-500 font-medium">
                    {getPriceRangeUnitPriceLabel(billingModel)}
                  </p>
                  <Controller
                    name={`priceRanges.${index}.unitPrice`}
                    control={control}
                    render={({ field: controllerField }) => (
                      <CommercialCurrencyInput
                        value={controllerField.value}
                        onChange={controllerField.onChange}
                        onPrecisionError={(message) => {
                          if (message) {
                            setError(`priceRanges.${index}.unitPrice`, {
                              message,
                            });
                          } else {
                            clearErrors(`priceRanges.${index}.unitPrice`);
                          }
                        }}
                        onBlur={() => {
                          controllerField.onBlur();
                          syncWithParent();
                        }}
                        classNames={defaultInputClassNames}
                        isInvalid={Boolean(errors.priceRanges?.[index]?.unitPrice)}
                        errorMessage={errors.priceRanges?.[index]?.unitPrice?.message}
                      />
                    )}
                  />
                </div>
                {index === fields.length - 1 && fields.length > 1 && (
                  <Button
                    isIconOnly
                    variant="light"
                    color="danger"
                    onPress={() => {
                      remove(index);
                      rechainImmediate();
                      syncWithParent();
                    }}
                    className="mb-0.5"
                  >
                    <Trash2 size={18} />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button
            variant="light"
            startContent={<CirclePlus size={16} />}
            className="text-primary"
            onPress={() => {
              const current = getValues("priceRanges") ?? [];
              const included = getValues("fixedPrice.includedConsultations") ?? 1;
              if (current.length === 0) {
                append(createDefaultRange(getFirstRangeMin(showFixedPrice, included)));
              } else {
                const prepared = closeLastRangeForAppend(current);
                setValue("priceRanges", prepared);
                const previousMax =
                  prepared[prepared.length - 1]?.maxConsultations ??
                  prepared[prepared.length - 1]?.minConsultations ??
                  1;
                append(createDefaultRange(getNextRangeMin(previousMax)));
              }
              rechainImmediate();
              syncWithParent();
            }}
          >
            Adicionar faixa
          </Button>
        </div>
      )}

      {showAutomaticBlocking && (
        <div className="pt-2">
          <Checkbox
            isSelected={watchedValues.automaticBlocking}
            onValueChange={(value) => {
              setValue("automaticBlocking", value);
              syncWithParent();
            }}
            classNames={{ label: "text-sm" }}
          >
            Bloqueio automático ao atingir o limite
          </Checkbox>
        </div>
      )}

      {showExcessPrice && (
        <div className="space-y-2">
          <p className="text-sm text-default-500 font-medium">Preço por consulta excedente <span className="text-danger">*</span></p>
          <Controller
            name="excessUnitPrice"
            control={control}
            render={({ field }) => (
              <CommercialCurrencyInput
                value={field.value ?? undefined}
                onChange={field.onChange}
                onPrecisionError={(message) => {
                  if (message) {
                    setError("excessUnitPrice", { message });
                  } else {
                    clearErrors("excessUnitPrice");
                  }
                }}
                onBlur={() => {
                  field.onBlur();
                  trigger("excessUnitPrice");
                  syncWithParent();
                }}
                classNames={getErrorClassNames(Boolean(errors.excessUnitPrice))}
                isInvalid={Boolean(errors.excessUnitPrice)}
                errorMessage={errors.excessUnitPrice?.message}
              />
            )}
          />
        </div>
      )}
    </div>
  );
});
