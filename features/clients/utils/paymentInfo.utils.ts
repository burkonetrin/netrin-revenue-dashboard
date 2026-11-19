/**
 * Utilitários de informações de pagamento, unificação de fatura e centros de lucro.
 */
import {
  type ProfitCenterSelectOption,
  defaultPaymentInfoFormValues,
} from "../components/PaymentInfoForm";
import type {
  PaymentArrangement,
  PaymentDueType,
  PaymentInfoFormValues,
  PaymentInfoRequest,
  PaymentInfoResponse,
  PaymentInfoStatusItemResponse,
} from "../types/contractsFranchises.types";

/**
 * Valor de unificação de fatura na UI.
 */
export type InvoiceUnificationUiValue = "" | "client" | "contract" | "franchise";

/**
 * Motivos de desabilitação por nível de unificação.
 */
export const invoiceUnificationDisabledReasons = {
  client:
    "Para selecionar esta opção, as informações de pagamento de todos os contratos precisam ser iguais",
  contract:
    "Para selecionar esta opção, as informações de pagamento das franquias de um mesmo contrato precisam ser iguais",
} as const;

/**
 * Disponibilidade de um nível de unificação.
 */
export type InvoiceUnificationLevelAvailability = {
  isEnabled: boolean;
  disabledReason?: string;
};

/**
 * Disponibilidade geral de unificação de fatura.
 */
export type InvoiceUnificationAvailability = {
  client: InvoiceUnificationLevelAvailability;
  contract: InvoiceUnificationLevelAvailability;
  franchise: InvoiceUnificationLevelAvailability;
};

interface PaymentInfoComparisonOptions {
  includeProfitCenters?: boolean;
}

/**
 * Verifica elegibilidade de pagamento no contrato.
 */
export function isContractEligibleForContractPayment({
  activeDeductiblesCount,
  productionDeductiblesCount,
}: {
  activeDeductiblesCount: number;
  productionDeductiblesCount: number;
}) {
  return activeDeductiblesCount === 0 || productionDeductiblesCount > 0;
}

/**
 * Verifica elegibilidade de pagamento na franquia.
 */
export function isFranchiseEligibleForPayment({
  isActive,
  isTest,
}: {
  isActive?: boolean | null;
  isTest?: boolean | null;
}) {
  return isActive !== false && isTest !== true;
}

/**
 * Normaliza nível de unificação para comparação.
 */
export function normalizeInvoiceUnificationLevel(
  level?: { value?: string | null } | null,
): InvoiceUnificationUiValue | null {
  if (level?.value === "client") return "client";
  if (level?.value === "contract") return "contract";
  if (level?.value === "deductible") return "franchise";
  return null;
}

function toIntegerOrNull(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function toNullableString(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

function buildPaymentInfoComparisonDataFromResponse(
  paymentInfo: PaymentInfoResponse,
  { includeProfitCenters = true }: PaymentInfoComparisonOptions = {},
) {
  return {
    nfeBranch: toNullableString(paymentInfo.nfeBranch),
    nfeBranchCode: toNullableString(paymentInfo.nfeBranchCode),
    paymentMethod: normalizeOptionValue(paymentInfo.paymentMethod),
    currency: normalizeOptionValue(paymentInfo.currency),
    ...(includeProfitCenters
      ? {
          profitCenterId: normalizeOptionValue(paymentInfo.profitCenter),
          overageProfitCenterId: normalizeOptionValue(paymentInfo.overageProfitCenter),
        }
      : {}),
    billingPeriodicity: toNullableString(paymentInfo.billingPeriodicity),
    dueAdditionalDays: paymentInfo.dueAdditionalDays ?? null,
    dueType: normalizeOptionValue(paymentInfo.dueType),
    dueWeekday: paymentInfo.dueWeekday ?? null,
    dueSpecificDay: paymentInfo.dueSpecificDay ?? null,
    dueDateRangeStart: paymentInfo.dueDateRangeStart ?? null,
    dueDateRangeEnd: paymentInfo.dueDateRangeEnd ?? null,
    paymentArrangement: normalizeOptionValue(paymentInfo.paymentArrangement),
    paymentPrepaidMonths: paymentInfo.paymentPrepaidMonths ?? null,
    paymentPostpaidMonths: paymentInfo.paymentPostpaidMonths ?? null,
    nfeAddConsumptionInfo: paymentInfo.nfeAddConsumptionInfo,
    nfeAddBankInfo: paymentInfo.nfeAddBankInfo,
    nfeAddOrderObservation: paymentInfo.nfeAddOrderObservation,
    nfeOrderObservationText: paymentInfo.nfeAddOrderObservation
      ? toNullableString(paymentInfo.nfeOrderObservationText)
      : null,
  };
}

function buildPaymentInfoComparisonDataFromRequest(
  paymentInfo: PaymentInfoRequest,
  { includeProfitCenters = true }: PaymentInfoComparisonOptions = {},
) {
  return {
    nfeBranch: toNullableString(paymentInfo.nfeBranch),
    nfeBranchCode: toNullableString(paymentInfo.nfeBranchCode),
    paymentMethod: paymentInfo.paymentMethod ?? null,
    currency: paymentInfo.currency ?? null,
    ...(includeProfitCenters
      ? {
          profitCenterId: toNullableString(paymentInfo.profitCenterId),
          overageProfitCenterId: toNullableString(paymentInfo.overageProfitCenterId),
        }
      : {}),
    billingPeriodicity: toNullableString(paymentInfo.billingPeriodicity),
    dueAdditionalDays: paymentInfo.dueAdditionalDays ?? null,
    dueType: normalizeDueType(paymentInfo.dueType),
    dueWeekday: paymentInfo.dueWeekday ?? null,
    dueSpecificDay: paymentInfo.dueSpecificDay ?? null,
    dueDateRangeStart: paymentInfo.dueDateRangeStart ?? null,
    dueDateRangeEnd: paymentInfo.dueDateRangeEnd ?? null,
    paymentArrangement: normalizePaymentArrangement(paymentInfo.paymentArrangement),
    paymentPrepaidMonths: paymentInfo.paymentPrepaidMonths ?? null,
    paymentPostpaidMonths: paymentInfo.paymentPostpaidMonths ?? null,
    nfeAddConsumptionInfo: paymentInfo.nfeAddConsumptionInfo ?? false,
    nfeAddBankInfo: paymentInfo.nfeAddBankInfo ?? false,
    nfeAddOrderObservation: paymentInfo.nfeAddOrderObservation ?? false,
    nfeOrderObservationText:
      paymentInfo.nfeAddOrderObservation && paymentInfo.nfeOrderObservationText
        ? toNullableString(paymentInfo.nfeOrderObservationText)
        : null,
  };
}

/**
 * Chave de comparação a partir da resposta.
 */
export function buildPaymentInfoComparisonKeyFromResponse(
  paymentInfo: PaymentInfoResponse,
  options?: PaymentInfoComparisonOptions,
) {
  return JSON.stringify(buildPaymentInfoComparisonDataFromResponse(paymentInfo, options));
}

/**
 * Chave de comparação a partir do request.
 */
export function buildPaymentInfoComparisonKeyFromRequest(
  paymentInfo: PaymentInfoRequest,
  options?: PaymentInfoComparisonOptions,
) {
  return JSON.stringify(buildPaymentInfoComparisonDataFromRequest(paymentInfo, options));
}

/**
 * Compara payload com resposta de pagamento.
 */
export function isPaymentInfoPayloadEqualToResponse(
  paymentInfoResponse: PaymentInfoResponse | null | undefined,
  paymentInfoPayload?: PaymentInfoRequest | null,
  options?: PaymentInfoComparisonOptions,
) {
  if (!paymentInfoResponse || !paymentInfoPayload) return false;
  return (
    buildPaymentInfoComparisonKeyFromResponse(paymentInfoResponse, options) ===
    buildPaymentInfoComparisonKeyFromRequest(paymentInfoPayload, options)
  );
}

/**
 * Verifica se formulário de pagamento foi alterado.
 */
export function isPaymentInfoFormDirty(
  baselineFormValues: PaymentInfoFormValues,
  payload: PaymentInfoRequest,
  options?: PaymentInfoComparisonOptions,
): boolean {
  const baselinePayload = buildPaymentInfoPayload({
    formValues: baselineFormValues,
    includeProfitCenters: options?.includeProfitCenters,
  });
  return (
    buildPaymentInfoComparisonKeyFromRequest(baselinePayload, options) !==
    buildPaymentInfoComparisonKeyFromRequest(payload, options)
  );
}

/**
 * Define se deve persistir pagamento do dono.
 */
export function shouldPersistOwnerPaymentInfo({
  ownPaymentInfo,
  baselineFormValues,
  payload,
  isChangingUnificationLevel = false,
  includeProfitCenters = true,
}: {
  ownPaymentInfo?: PaymentInfoResponse | null;
  baselineFormValues?: PaymentInfoFormValues | null;
  payload?: PaymentInfoRequest | null;
  isChangingUnificationLevel?: boolean;
  includeProfitCenters?: boolean;
}) {
  if (!payload) return false;

  const hasOwnRecord = ownPaymentInfo !== null && ownPaymentInfo !== undefined;
  const isFormDirty =
    baselineFormValues !== null && baselineFormValues !== undefined
      ? isPaymentInfoFormDirty(baselineFormValues, payload, { includeProfitCenters })
      : true;

  return isFormDirty || (!hasOwnRecord && isChangingUnificationLevel) || !hasOwnRecord;
}

/**
 * Compara duas informações de pagamento.
 */
export function arePaymentInfosEqual(
  paymentInfos: Array<PaymentInfoResponse | null | undefined>,
  options?: PaymentInfoComparisonOptions,
) {
  const presentPaymentInfos = paymentInfos.filter(
    (paymentInfo): paymentInfo is PaymentInfoResponse => Boolean(paymentInfo),
  );

  if (presentPaymentInfos.length === 0) return false;

  const keys = presentPaymentInfos.map((paymentInfo) =>
    buildPaymentInfoComparisonKeyFromResponse(paymentInfo, options),
  );
  return new Set(keys).size === 1;
}

/**
 * Obtém campos comuns entre informações de pagamento.
 */
export function getCommonPaymentInfo(
  paymentInfos: Array<PaymentInfoResponse | null | undefined>,
  options?: PaymentInfoComparisonOptions,
) {
  if (!arePaymentInfosEqual(paymentInfos, options)) {
    return null;
  }

  return (
    paymentInfos.find((paymentInfo): paymentInfo is PaymentInfoResponse => Boolean(paymentInfo)) ?? null
  );
}

function normalizePaymentArrangement(value: string | null | undefined): PaymentArrangement {
  const normalized = value?.toLowerCase();
  if (normalized === "prepaid" || normalized === "postpaid") {
    return normalized;
  }
  return "standard";
}

function normalizeDueType(value: string | null | undefined): PaymentDueType {
  const normalized = value?.toLowerCase();
  if (normalized === "weekday" || normalized === "specific_day" || normalized === "date_range") {
    return normalized;
  }
  return "standard";
}

function normalizeOptionValue(option: PaymentInfoResponse["currency"] | null | undefined) {
  return toNullableString(option?.value);
}

function getStatusItemType(item: PaymentInfoStatusItemResponse) {
  const value = item.ownerType.value.toLowerCase();
  if (value.includes("contract")) return "contract";
  if (value.includes("deductible") || value.includes("franchise")) return "franchise";
  return "other";
}

function isPaymentInfoStatusFilled(item: PaymentInfoStatusItemResponse) {
  return item.isFilled && Boolean(item.paymentInfo);
}

function hasAnyRegisteredPaymentInfo(
  items: PaymentInfoStatusItemResponse[],
  clientPaymentInfo?: PaymentInfoResponse | null,
) {
  if (clientPaymentInfo) return true;

  return items.some((item) => {
    if (!isPaymentInfoStatusFilled(item)) return false;

    if (getStatusItemType(item) === "contract") return true;

    if (getStatusItemType(item) === "franchise") {
      return isFranchiseEligibleForPayment({
        isActive: item.isActive,
        isTest: item.isTest,
      });
    }

    return false;
  });
}

function haveEqualPaymentInfos(
  items: PaymentInfoStatusItemResponse[],
  options?: PaymentInfoComparisonOptions,
) {
  if (items.length === 0) return true;

  const filledItems = items.filter(
    (item): item is PaymentInfoStatusItemResponse & { paymentInfo: PaymentInfoResponse } =>
      isPaymentInfoStatusFilled(item),
  );
  if (filledItems.length === 0) return true;
  if (filledItems.length < items.length) return false;

  const keys = filledItems.map((item) =>
    buildPaymentInfoComparisonKeyFromResponse(item.paymentInfo, options),
  );

  return new Set(keys).size <= 1;
}

const allInvoiceUnificationLevelsEnabled: InvoiceUnificationAvailability = {
  client: { isEnabled: true },
  contract: { isEnabled: true },
  franchise: { isEnabled: true },
};

/**
 * Calcula disponibilidade de unificação na UI.
 */
export function getInvoiceUnificationAvailability(
  items: PaymentInfoStatusItemResponse[],
  { clientPaymentInfo }: { clientPaymentInfo?: PaymentInfoResponse | null } = {},
): InvoiceUnificationAvailability {
  const contractItems = items.filter((item) => getStatusItemType(item) === "contract");
  const franchiseItems = items.filter(
    (item) =>
      getStatusItemType(item) === "franchise" &&
      isFranchiseEligibleForPayment({
        isActive: item.isActive,
        isTest: item.isTest,
      }),
  );

  if (!hasAnyRegisteredPaymentInfo(items, clientPaymentInfo)) {
    return allInvoiceUnificationLevelsEnabled;
  }

  const franchisesByContract = new Map<string, PaymentInfoStatusItemResponse[]>();

  for (const item of franchiseItems) {
    const parentId = item.ownerParentId ?? "without-contract";
    franchisesByContract.set(parentId, [...(franchisesByContract.get(parentId) ?? []), item]);
  }

  const contractEffectiveInfos = contractItems.map((contract) => {
    const contractFranchises = franchisesByContract.get(contract.ownerId) ?? [];
    const franchiseConsensus = getCommonPaymentInfo(
      contractFranchises.map((item) => item.paymentInfo),
      { includeProfitCenters: false },
    );
    return contract.paymentInfo ?? franchiseConsensus;
  });

  const filledContractEffectiveInfos = contractEffectiveInfos.filter(
    (item): item is PaymentInfoResponse => Boolean(item),
  );

  const canSelectClient =
    contractItems.length > 0
      ? filledContractEffectiveInfos.length === 0 ||
        (contractEffectiveInfos.every((item) => Boolean(item)) &&
          arePaymentInfosEqual(contractEffectiveInfos as PaymentInfoResponse[], {
            includeProfitCenters: false,
          }))
      : franchiseItems.length === 0 ||
        (Array.from(franchisesByContract.values()).every((group) =>
          haveEqualPaymentInfos(group, { includeProfitCenters: false }),
        ) &&
          arePaymentInfosEqual(
            Array.from(franchisesByContract.values())
              .map((group) =>
                getCommonPaymentInfo(
                  group.map((item) => item.paymentInfo),
                  {
                    includeProfitCenters: false,
                  },
                ),
              )
              .filter((item): item is PaymentInfoResponse => Boolean(item)),
            { includeProfitCenters: false },
          ));

  const canSelectContract =
    contractItems.length > 0
      ? contractItems.every((contract) => {
          const contractFranchises = franchisesByContract.get(contract.ownerId) ?? [];
          if (contractFranchises.length === 0) return true;
          return haveEqualPaymentInfos(contractFranchises, { includeProfitCenters: false });
        })
      : franchiseItems.length === 0 ||
        Array.from(franchisesByContract.values()).every((group) =>
          haveEqualPaymentInfos(group, { includeProfitCenters: false }),
        );

  return {
    client: {
      isEnabled: canSelectClient,
      disabledReason: canSelectClient ? undefined : invoiceUnificationDisabledReasons.client,
    },
    contract: {
      isEnabled: canSelectContract,
      disabledReason: canSelectContract ? undefined : invoiceUnificationDisabledReasons.contract,
    },
    franchise: {
      isEnabled: true,
    },
  };
}

/**
 * Resolve valores iniciais de pagamento do cliente.
 */
export function resolveClientFormPaymentInfo(
  clientPaymentInfo?: PaymentInfoResponse | null,
  consensusPaymentInfo?: PaymentInfoResponse | null,
): PaymentInfoResponse | null {
  return clientPaymentInfo ?? consensusPaymentInfo ?? null;
}

/**
 * Resolve unificação inicial do formulário.
 */
export function resolveInitialInvoiceUnification({
  defaultInvoiceUnification,
  initialContractOwner,
  initialFranchiseOwner,
}: {
  defaultInvoiceUnification?: InvoiceUnificationUiValue | null;
  initialContractOwner?: { id: string } | null;
  initialFranchiseOwner?: { id: string } | null;
}): InvoiceUnificationUiValue {
  if (initialFranchiseOwner) return "franchise";
  if (initialContractOwner) return "contract";
  return defaultInvoiceUnification ?? "";
}

/**
 * Obtém pagamento herdado do nível superior.
 */
export function getInheritedPaymentInfo({
  level,
  clientPaymentInfo,
  contractPaymentInfo,
  franchisePaymentInfo,
}: {
  level: InvoiceUnificationUiValue;
  clientPaymentInfo?: PaymentInfoResponse | null;
  contractPaymentInfo?: PaymentInfoResponse | null;
  franchisePaymentInfo?: PaymentInfoResponse | null;
}): PaymentInfoResponse | null {
  if (franchisePaymentInfo) return franchisePaymentInfo;
  if (level === "franchise") return contractPaymentInfo ?? clientPaymentInfo ?? null;
  if (contractPaymentInfo) return contractPaymentInfo;
  if (level === "contract") return clientPaymentInfo ?? null;
  return null;
}

/**
 * Resolve pagamento do dono no formulário.
 */
export function resolveOwnerFormPaymentInfo({
  level,
  clientPaymentInfo,
  ownPaymentInfo,
  parentPaymentInfo,
}: {
  level: InvoiceUnificationUiValue;
  clientPaymentInfo?: PaymentInfoResponse | null;
  ownPaymentInfo?: PaymentInfoResponse | null;
  parentPaymentInfo?: PaymentInfoResponse | null;
}): PaymentInfoResponse | null {
  if (ownPaymentInfo) return ownPaymentInfo;

  return getInheritedPaymentInfo({
    level,
    clientPaymentInfo,
    contractPaymentInfo: parentPaymentInfo ?? null,
    franchisePaymentInfo: null,
  });
}

/**
 * Estado efetivo do dono de pagamento.
 */
export function getEffectivePaymentOwnerState({
  invoiceUnification,
  clientPaymentInfo,
  ownerPaymentInfo,
  parentPaymentInfo,
}: {
  invoiceUnification: InvoiceUnificationUiValue;
  clientPaymentInfo?: PaymentInfoResponse | null;
  ownerPaymentInfo?: PaymentInfoResponse | null;
  parentPaymentInfo?: PaymentInfoResponse | null;
}) {
  const effectivePaymentInfo = getInheritedPaymentInfo({
    level: invoiceUnification,
    clientPaymentInfo,
    contractPaymentInfo: parentPaymentInfo,
    franchisePaymentInfo: ownerPaymentInfo,
  });

  return {
    paymentInfo: effectivePaymentInfo,
    isFilled: Boolean(effectivePaymentInfo),
  };
}

/**
 * Mapeia resposta de pagamento para o formulário.
 */
export function mapPaymentInfoResponseToFormValues(
  paymentInfo?: PaymentInfoResponse | null,
): PaymentInfoFormValues {
  if (!paymentInfo) return defaultPaymentInfoFormValues;

  return {
    ...defaultPaymentInfoFormValues,
    nfeBranch: paymentInfo.nfeBranch ?? "",
    nfeBranchCode: paymentInfo.nfeBranchCode ?? "",
    paymentArrangement: normalizePaymentArrangement(paymentInfo.paymentArrangement?.value),
    paymentPrepaidMonths:
      paymentInfo.paymentPrepaidMonths !== null && paymentInfo.paymentPrepaidMonths !== undefined
        ? String(paymentInfo.paymentPrepaidMonths)
        : "",
    paymentPostpaidMonths:
      paymentInfo.paymentPostpaidMonths !== null && paymentInfo.paymentPostpaidMonths !== undefined
        ? String(paymentInfo.paymentPostpaidMonths)
        : "",
    paymentMethod:
      paymentInfo.paymentMethod?.value === "BOLETO" ||
      paymentInfo.paymentMethod?.value === "TRANSFERENCIA_BANCARIA"
        ? paymentInfo.paymentMethod.value
        : "",
    currency: paymentInfo.currency?.value === "USD" ? "USD" : "BRL",
    profitCenter: paymentInfo.profitCenter?.value ?? "",
    overflowProfitCenter: paymentInfo.overageProfitCenter?.value ?? "",
    additionalDays:
      paymentInfo.dueAdditionalDays !== null && paymentInfo.dueAdditionalDays !== undefined
        ? String(paymentInfo.dueAdditionalDays)
        : "",
    billingPeriodicity: paymentInfo.billingPeriodicity ?? "1",
    dueType: normalizeDueType(paymentInfo.dueType?.value),
    dueWeekday:
      paymentInfo.dueWeekday !== null && paymentInfo.dueWeekday !== undefined
        ? String(paymentInfo.dueWeekday)
        : "",
    dueSpecificDay:
      paymentInfo.dueSpecificDay !== null && paymentInfo.dueSpecificDay !== undefined
        ? String(paymentInfo.dueSpecificDay)
        : "",
    dueDateRangeStart:
      paymentInfo.dueDateRangeStart !== null && paymentInfo.dueDateRangeStart !== undefined
        ? String(paymentInfo.dueDateRangeStart)
        : "",
    dueDateRangeEnd:
      paymentInfo.dueDateRangeEnd !== null && paymentInfo.dueDateRangeEnd !== undefined
        ? String(paymentInfo.dueDateRangeEnd)
        : "",
    addClientConsumptionInfo: paymentInfo.nfeAddConsumptionInfo ?? false,
    addBankInfo: paymentInfo.nfeAddBankInfo ?? false,
    addOrderNote: paymentInfo.nfeAddOrderObservation ?? false,
    orderNote: paymentInfo.nfeOrderObservationText ?? "",
  };
}

/**
 * Monta payload de informações de pagamento.
 */
export function buildPaymentInfoPayload({
  formValues,
  includeProfitCenters = true,
}: {
  formValues?: PaymentInfoFormValues;
  includeProfitCenters?: boolean;
}): PaymentInfoRequest {
  if (!formValues) return {};

  return {
    nfeBranch: toNullableString(formValues.nfeBranch),
    nfeBranchCode: toNullableString(formValues.nfeBranchCode),
    paymentMethod: formValues.paymentMethod || null,
    currency: formValues.currency || null,
    ...(includeProfitCenters
      ? {
          profitCenterId: toNullableString(formValues.profitCenter),
          overageProfitCenterId: toNullableString(formValues.overflowProfitCenter),
        }
      : {}),
    billingPeriodicity: toNullableString(formValues.billingPeriodicity),
    dueAdditionalDays: toIntegerOrNull(formValues.additionalDays),
    dueType: formValues.dueType,
    dueWeekday: formValues.dueType === "weekday" ? toIntegerOrNull(formValues.dueWeekday) : null,
    dueSpecificDay:
      formValues.dueType === "specific_day" ? toIntegerOrNull(formValues.dueSpecificDay) : null,
    dueDateRangeStart:
      formValues.dueType === "date_range" ? toIntegerOrNull(formValues.dueDateRangeStart) : null,
    dueDateRangeEnd:
      formValues.dueType === "date_range" ? toIntegerOrNull(formValues.dueDateRangeEnd) : null,
    paymentArrangement: formValues.paymentArrangement,
    paymentPrepaidMonths:
      formValues.paymentArrangement === "prepaid"
        ? toIntegerOrNull(formValues.paymentPrepaidMonths)
        : null,
    paymentPostpaidMonths:
      formValues.paymentArrangement === "postpaid"
        ? toIntegerOrNull(formValues.paymentPostpaidMonths)
        : null,
    nfeAddConsumptionInfo: formValues.addClientConsumptionInfo,
    nfeAddBankInfo: formValues.addBankInfo,
    nfeAddOrderObservation: formValues.addOrderNote,
    nfeOrderObservationText: formValues.addOrderNote
      ? toNullableString(formValues.orderNote)
      : null,
  };
}

/**
 * Formata centros de lucro para select.
 */
export function formatProfitCenterOptions(
  profitCenters: Array<{ id: string; code: string; name: string; isActive?: boolean }>,
): ProfitCenterSelectOption[] {
  return profitCenters
    .filter((profitCenter) => profitCenter.isActive !== false)
    .map((profitCenter) => ({
      value: profitCenter.id,
      label: `${profitCenter.code} - ${profitCenter.name}`,
    }));
}
