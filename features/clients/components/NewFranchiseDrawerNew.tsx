/**
 * Drawer de criação e edição de franquia no fluxo novo.
 */
import {
  useAssignBackgroundCheckTemplateToDeductible,
  useBackgroundCheckTemplatesByDeductible,
} from "@/features/background-check-templates";
import { useContractDetails } from "@/features/contracts/hooks/useContractDetails";
import { PRODUCTS_PERMISSIONS } from "@/features/products/constants/productsPermissions.constants";
import { useListSellableProducts } from "@/features/products/hooks/useListSellableProducts";
import type { Product } from "@/features/products/types/products.types";
import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { usePermission } from "@/shared/hooks/usePermission";
import { toNumericDecimal } from "@/shared/utils/currency";
import { Button, Spinner, addToast } from "@heroui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CLIENTS_PERMISSIONS } from "../constants/clientsPermissions.constants";
import { useAssignDeductibleBundles } from "../hooks/useAssignDeductibleBundles";
import { useAssignDeductibleDataSources } from "../hooks/useAssignDeductibleDataSources";
import { useBillingModels } from "../hooks/useBillingModels";
import { useCreateDeductible } from "../hooks/useCreateDeductible";
import { useDeductibleIndividualLinkedDataSources } from "../hooks/useDeductibleIndividualLinkedDataSources";
import { useDeductiblePaymentInfo } from "../hooks/useDeductiblePaymentInfo";
import { useDeductibleProfitCenter } from "../hooks/useDeductibleProfitCenter";
import { useGetDeductible } from "../hooks/useGetDeductible";
import { useProfitCenters } from "../hooks/useProfitCenters";
import { useRemoveDeductibleBundles } from "../hooks/useRemoveDeductibleBundles";
import { useRemoveDeductibleDataSources } from "../hooks/useRemoveDeductibleDataSources";
import { useSaveDeductiblePaymentInfo } from "../hooks/useSaveDeductiblePaymentInfo";
import { useSaveDeductibleProfitCenter } from "../hooks/useSaveDeductibleProfitCenter";
import { useUpdateDeductible } from "../hooks/useUpdateDeductible";
import type { Client } from "../types/clients.types";
import type { PaymentInfoFormValues } from "../types/contractsFranchises.types";
import type {
  DeductibleSourcesSnapshot,
  FranchiseSourcesStepState,
} from "../types/deductible-sources.types";
import {
  INITIAL_SOURCES_SNAPSHOT,
  INITIAL_SOURCES_STEP_STATE,
} from "../types/deductible-sources.types";
import type { CreateDeductibleRequest } from "../types/deductibles.types";
import {
  buildDeductiblePayload,
  findBillingModelOption,
  findMinimumContractBillingModel,
} from "../utils/billingModel.utils";
import {
  applyTestFranchiseDefaults,
  mergeDeductibleFormState,
} from "../utils/deductibleTestFranchise.utils";
import {
  type FranchiseDrawerStep,
  getFranchisePrimaryActionLabel,
  isFranchiseStepProceedable,
  shouldPersistFranchiseOnStepProceed,
} from "../utils/franchiseDrawer.utils";
import { mapDeductibleToFormState } from "../utils/mapDeductibleToFormState.utils";
import {
  buildPaymentInfoPayload,
  formatProfitCenterOptions,
  mapPaymentInfoResponseToFormValues,
} from "../utils/paymentInfo.utils";
import { syncFranchiseSourcesLinks } from "../utils/syncFranchiseSourcesLinks.utils";
import { FranchiseStepBackgroundCheckTemplateNew } from "./FranchiseStepBackgroundCheckTemplateNew";
import {
  type FranchiseBasicProfitCenterState,
  FranchiseStepBasicDataNew,
  type FranchiseStepBasicDataNewHandle,
} from "./FranchiseStepBasicDataNew";
import {
  FranchiseStepBillingNew,
  type FranchiseStepBillingNewHandle,
} from "./FranchiseStepBillingNew";
import { FranchiseStepSourcesNew } from "./FranchiseStepSourcesNew";
import { PaymentInfoForm, type PaymentInfoFormApi } from "./PaymentInfoForm";

const EMPTY_PROFIT_CENTER_STATE: FranchiseBasicProfitCenterState = {
  profitCenterId: "",
  overageProfitCenterId: "",
};

interface NewFranchiseDrawerNewProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  clientId: string;
  deductibleId?: string;
  initialStep?: FranchiseDrawerStep;
  nfeUnificationLevel?: Client["nfeUnificationLevel"] | null;
  clientIsTest?: boolean;
  /** Mesma apresentação do fluxo Nova franquia (título e ações intermediárias). */
  wizardPresentation?: "create" | "edit";
}

/**
 * Identificador de passo do drawer de franquia.
 */
export type { FranchiseDrawerStep } from "../utils/franchiseDrawer.utils";

const initialState: CreateDeductibleRequest = {
  name: "",
  description: "",
  isTest: false,
  beginningTerm: "",
  endTerm: "",
  automaticRenovation: true,
  proofExpiration: 1,
  billingModel: "fixed_price",
  automaticBlocking: false,
  isActive: true,
  excessUnitPrice: 0,
  productIds: [],
  fixedPrice: {
    includedConsultations: 1,
    packagePrice: 0,
  },
  priceRanges: [],
};

function isBgcProduct(product: Pick<Product, "id" | "name" | "internalName">) {
  return [product.id, product.name, product.internalName].filter(Boolean).some((value) => {
    const normalized = String(value).toLowerCase();
    return (
      normalized.includes("bgc") ||
      normalized.includes("background check") ||
      normalized.includes("background-check") ||
      normalized.includes("background_check") ||
      normalized.includes("backgroundcheck")
    );
  });
}

/**
 * Drawer de criação de franquia (fluxo novo).
 */
export function NewFranchiseDrawerNew({
  isOpen,
  onClose,
  contractId,
  clientId,
  deductibleId,
  initialStep = "basic",
  nfeUnificationLevel,
  clientIsTest = false,
  wizardPresentation = "edit",
}: NewFranchiseDrawerNewProps) {
  const { can } = usePermission();
  const canListProducts =
    can(CLIENTS_PERMISSIONS.createDeductibleListProducts) || can(PRODUCTS_PERMISSIONS.access);
  const canListDataSources =
    can(CLIENTS_PERMISSIONS.createDeductibleListDataSources) ||
    can("providerManagement.dataSources");
  const canListDataSourceBundles =
    can(CLIENTS_PERMISSIONS.createDeductibleListDataSourceBundles) ||
    can("providerManagement.dataSourceBundles");
  const canListBackgroundCheckTemplates =
    can(CLIENTS_PERMISSIONS.createDeductibleListBackgroundCheckTemplates) ||
    can("providerManagement.backgroundCheckTemplates");
  const [step, setStep] = useState<FranchiseDrawerStep>(initialStep);
  const [state, setState] = useState<CreateDeductibleRequest>(initialState);
  const [paymentFormValues, setPaymentFormValues] = useState<PaymentInfoFormValues | null>(null);
  const [profitCenterState, setProfitCenterState] =
    useState<FranchiseBasicProfitCenterState>(EMPTY_PROFIT_CENTER_STATE);
  const profitCenterStateRef = useRef(profitCenterState);
  profitCenterStateRef.current = profitCenterState;
  const profitCenterHydratedForRef = useRef<string | null>(null);
  const [sourcesStep, setSourcesStep] = useState<FranchiseSourcesStepState>(
    INITIAL_SOURCES_STEP_STATE,
  );
  const sourcesInitialSnapshotRef = useRef<DeductibleSourcesSnapshot>(INITIAL_SOURCES_SNAPSHOT);
  const hydratedSourcesForDeductibleRef = useRef<string | null>(null);
  const hydratedTemplatesForDeductibleRef = useRef<string | null>(null);
  const basicDataRef = useRef<FranchiseStepBasicDataNewHandle>(null);
  const billingStepRef = useRef<FranchiseStepBillingNewHandle>(null);
  const paymentInfoApiRef = useRef<PaymentInfoFormApi | null>(null);
  const wasOpenRef = useRef(false);
  const appliedTemplateInitialStepRef = useRef(false);
  const initializedSessionRef = useRef(false);
  const editHydratedRef = useRef(false);
  const [isEditStateHydrated, setIsEditStateHydrated] = useState(false);
  const [hydrationVersion, setHydrationVersion] = useState(0);
  const [isSavingSources, setIsSavingSources] = useState(false);
  const [selectedBackgroundCheckTemplateIds, setSelectedBackgroundCheckTemplateIds] = useState<
    string[]
  >([]);
  const [persistedDeductibleId, setPersistedDeductibleId] = useState<string | null>(null);

  const { mutateAsync: createDeductible, isPending: isCreating } = useCreateDeductible();
  const { mutateAsync: updateDeductible, isPending: isUpdating } = useUpdateDeductible();
  const saveDeductiblePaymentInfo = useSaveDeductiblePaymentInfo();
  const saveDeductibleProfitCenter = useSaveDeductibleProfitCenter({ showToast: false });
  const assignDataSources = useAssignDeductibleDataSources();
  const removeDataSources = useRemoveDeductibleDataSources();
  const assignBundles = useAssignDeductibleBundles();
  const removeBundles = useRemoveDeductibleBundles();
  const assignBackgroundCheckTemplate = useAssignBackgroundCheckTemplateToDeductible();

  const isEdit = Boolean(deductibleId);
  const effectiveDeductibleId = deductibleId ?? persistedDeductibleId ?? undefined;
  const isPersisted = Boolean(effectiveDeductibleId);
  const showEditWizardChrome = isPersisted && wizardPresentation === "edit";
  const isPending =
    isCreating ||
    isUpdating ||
    saveDeductiblePaymentInfo.isPending ||
    saveDeductibleProfitCenter.isPending ||
    isSavingSources ||
    assignDataSources.isPending ||
    removeDataSources.isPending ||
    assignBundles.isPending ||
    removeBundles.isPending ||
    assignBackgroundCheckTemplate.isPending;

  const { data: deductibleData, isLoading: isLoadingDeductible } = useGetDeductible(
    contractId,
    deductibleId,
  );

  const { data: deductiblePaymentInfo, isLoading: isLoadingDeductiblePaymentInfo } =
    useDeductiblePaymentInfo(clientId, contractId, effectiveDeductibleId);

  const { data: deductibleProfitCenter, isLoading: isLoadingDeductibleProfitCenter } =
    useDeductibleProfitCenter(clientId, contractId, effectiveDeductibleId);

  const {
    bundles: linkedBundles,
    individualSources: individualLinkedSources,
    isLoading: isLoadingLinkedSourcesData,
  } = useDeductibleIndividualLinkedDataSources(effectiveDeductibleId, {
    enabled: isPersisted && isOpen,
  });

  const { data: linkedBackgroundCheckTemplates, isLoading: isLoadingLinkedTemplates } =
    useBackgroundCheckTemplatesByDeductible(effectiveDeductibleId, {
      enabled: isPersisted && isOpen,
    });

  const isLoadingLinkedSourcesStep = isPersisted && isLoadingLinkedSourcesData;

  const { data: contract } = useContractDetails(clientId, contractId);
  const contractMinimumValue = toNumericDecimal(contract?.minimumValue);
  const { data: billingModels = [] } = useBillingModels();
  const { data: profitCenters = [], isLoading: isLoadingProfitCenters } = useProfitCenters();
  const { data: productsResponse } = useListSellableProducts(
    {
      page: 1,
      pageSize: 100,
      sortBy: "name",
      sortDirection: "asc",
    },
    { enabled: isOpen && canListProducts },
  );
  const minimumContractBillingModel = findMinimumContractBillingModel(billingModels)?.value;
  const shouldIncludePaymentStep = nfeUnificationLevel?.value === "deductible" && !state.isTest;
  const selectedProductIds = useMemo(
    () => state.productIds.map((product) => product.productId),
    [state.productIds],
  );
  const hasSelectedBgcProduct = useMemo(() => {
    const products = canListProducts ? (productsResponse?.data ?? []) : [];
    const selectedProducts = [
      ...products.filter((product) => selectedProductIds.includes(product.id)),
      ...(deductibleData?.products ?? []),
    ];
    return selectedProducts.some(isBgcProduct);
  }, [canListProducts, deductibleData?.products, productsResponse?.data, selectedProductIds]);
  const steps = useMemo<FranchiseDrawerStep[]>(
    () => [
      "basic",
      ...(shouldIncludePaymentStep ? (["payment"] as const) : []),
      "billing",
      ...(hasSelectedBgcProduct ? (["templates"] as const) : (["sources"] as const)),
    ],
    [hasSelectedBgcProduct, shouldIncludePaymentStep],
  );
  const currentStepIndex = Math.max(steps.indexOf(step), 0);
  const lastStep = steps[steps.length - 1];
  const profitCenterOptions = useMemo(
    () => formatProfitCenterOptions(profitCenters),
    [profitCenters],
  );
  const paymentInfoDefaultValues = useMemo(
    () => mapPaymentInfoResponseToFormValues(deductiblePaymentInfo),
    [deductiblePaymentInfo],
  );
  const isPaymentStepLoading =
    shouldIncludePaymentStep &&
    isPersisted &&
    isLoadingDeductiblePaymentInfo &&
    deductiblePaymentInfo === undefined;

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setStep(steps.includes(initialStep) ? initialStep : steps[0]);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialStep, steps]);

  useEffect(() => {
    if (!isOpen || steps.includes(step)) return;
    setStep(steps[0]);
  }, [isOpen, step, steps]);

  useEffect(() => {
    if (
      !isOpen ||
      appliedTemplateInitialStepRef.current ||
      initialStep !== "templates" ||
      !steps.includes("templates")
    ) {
      return;
    }
    appliedTemplateInitialStepRef.current = true;
    if (step !== "templates") setStep("templates");
  }, [isOpen, initialStep, step, steps]);

  useEffect(() => {
    if (!hasSelectedBgcProduct) return;
    setSourcesStep(INITIAL_SOURCES_STEP_STATE);
    sourcesInitialSnapshotRef.current = INITIAL_SOURCES_SNAPSHOT;
    if (step === "sources") setStep("basic");
  }, [hasSelectedBgcProduct, step]);

  useEffect(() => {
    if (!isOpen) {
      initializedSessionRef.current = false;
      appliedTemplateInitialStepRef.current = false;
      editHydratedRef.current = false;
      setIsEditStateHydrated(false);
      setHydrationVersion(0);
      setPersistedDeductibleId(null);
      setProfitCenterState(EMPTY_PROFIT_CENTER_STATE);
      profitCenterHydratedForRef.current = null;
      hydratedSourcesForDeductibleRef.current = null;
      hydratedTemplatesForDeductibleRef.current = null;
      return;
    }

    if (!isEdit) {
      if (!initializedSessionRef.current) {
        initializedSessionRef.current = true;
        setState(
          clientIsTest
            ? applyTestFranchiseDefaults({ ...initialState, isTest: true })
            : initialState,
        );
        setPaymentFormValues(null);
        setProfitCenterState(EMPTY_PROFIT_CENTER_STATE);
        profitCenterHydratedForRef.current = null;
        setSourcesStep(INITIAL_SOURCES_STEP_STATE);
        sourcesInitialSnapshotRef.current = INITIAL_SOURCES_SNAPSHOT;
        setSelectedBackgroundCheckTemplateIds([]);
      }
      setIsEditStateHydrated(true);
      return;
    }

    if (deductibleData && !editHydratedRef.current) {
      editHydratedRef.current = true;
      setState(mapDeductibleToFormState(deductibleData));
      setHydrationVersion((v) => v + 1);
      setIsEditStateHydrated(true);
    }
  }, [isEdit, deductibleData, isOpen, clientIsTest]);

  useEffect(() => {
    if (!isOpen || !effectiveDeductibleId || isLoadingDeductibleProfitCenter) return;
    if (profitCenterHydratedForRef.current === effectiveDeductibleId) return;

    profitCenterHydratedForRef.current = effectiveDeductibleId;
    const nextProfitCenter = {
      profitCenterId: deductibleProfitCenter?.profitCenter?.value ?? "",
      overageProfitCenterId: deductibleProfitCenter?.overageProfitCenter?.value ?? "",
    };
    profitCenterStateRef.current = nextProfitCenter;
    setProfitCenterState(nextProfitCenter);
  }, [
    isOpen,
    effectiveDeductibleId,
    isLoadingDeductibleProfitCenter,
    deductibleProfitCenter?.profitCenter?.value,
    deductibleProfitCenter?.overageProfitCenter?.value,
  ]);

  useEffect(() => {
    if (!isPersisted || !isOpen || !effectiveDeductibleId) return;
    if (isLoadingLinkedSourcesData) return;
    if (hydratedSourcesForDeductibleRef.current === effectiveDeductibleId) return;

    hydratedSourcesForDeductibleRef.current = effectiveDeductibleId;

    const bundleIds = linkedBundles.map((b) => b.id);
    const dataSourceIds = individualLinkedSources.map((s) => s.id);

    sourcesInitialSnapshotRef.current = { bundleIds, dataSourceIds };
    setSourcesStep({
      selectedBundleIds: bundleIds,
      selectedSources: individualLinkedSources.map((s) => ({ id: s.id, name: s.name })),
    });
  }, [
    isPersisted,
    isOpen,
    effectiveDeductibleId,
    linkedBundles,
    individualLinkedSources,
    isLoadingLinkedSourcesData,
  ]);

  useEffect(() => {
    if (!isPersisted || !isOpen || !effectiveDeductibleId || isLoadingLinkedTemplates) return;
    if (hydratedTemplatesForDeductibleRef.current === effectiveDeductibleId) return;

    hydratedTemplatesForDeductibleRef.current = effectiveDeductibleId;
    const templateIds = (linkedBackgroundCheckTemplates ?? []).map((template) => template.id);
    setSelectedBackgroundCheckTemplateIds(templateIds);
  }, [
    isPersisted,
    isOpen,
    effectiveDeductibleId,
    linkedBackgroundCheckTemplates,
    isLoadingLinkedTemplates,
  ]);

  useEffect(() => {
    if (
      contractMinimumValue > 0 &&
      !state.isTest &&
      minimumContractBillingModel &&
      state.billingModel !== minimumContractBillingModel &&
      isOpen
    ) {
      setState((prev) => ({
        ...prev,
        billingModel: minimumContractBillingModel,
      }));
    }
  }, [contractMinimumValue, state.isTest, state.billingModel, isOpen, minimumContractBillingModel]);

  const resetDrawer = () => {
    setStep("basic");
    setState(initialState);
    setPaymentFormValues(null);
    setProfitCenterState(EMPTY_PROFIT_CENTER_STATE);
    profitCenterHydratedForRef.current = null;
    setSourcesStep(INITIAL_SOURCES_STEP_STATE);
    sourcesInitialSnapshotRef.current = INITIAL_SOURCES_SNAPSHOT;
    setSelectedBackgroundCheckTemplateIds([]);
    setPersistedDeductibleId(null);
    hydratedSourcesForDeductibleRef.current = null;
    hydratedTemplatesForDeductibleRef.current = null;
    initializedSessionRef.current = false;
    appliedTemplateInitialStepRef.current = false;
    editHydratedRef.current = false;
    setIsEditStateHydrated(false);
    setHydrationVersion(0);
    onClose();
  };

  const mergeDeductibleState = useCallback((next: Partial<CreateDeductibleRequest>) => {
    setState((prev) => mergeDeductibleFormState(prev, next));
  }, []);

  const handleProfitCenterChange = useCallback((next: FranchiseBasicProfitCenterState) => {
    profitCenterStateRef.current = next;
    setProfitCenterState(next);
  }, []);

  const updateSourcesStep = useCallback((next: Partial<FranchiseSourcesStepState>) => {
    setSourcesStep((prev) => ({ ...prev, ...next }));
  }, []);

  const buildPayload = useCallback((): CreateDeductibleRequest => {
    const selectedOption = findBillingModelOption(state.billingModel, billingModels);
    return buildDeductiblePayload(state, selectedOption);
  }, [state, billingModels]);

  const syncSourcesLinks = useCallback(
    async (targetDeductibleId: string, isEditMode: boolean) => {
      await syncFranchiseSourcesLinks(
        contractId,
        targetDeductibleId,
        isEditMode,
        sourcesStep.selectedBundleIds,
        sourcesStep.selectedSources.map((source) => source.id),
        sourcesInitialSnapshotRef.current,
        {
          assignDataSources,
          removeDataSources,
          assignBundles,
          removeBundles,
        },
      );
    },
    [sourcesStep, contractId, assignBundles, removeBundles, assignDataSources, removeDataSources],
  );

  const syncBackgroundCheckTemplate = useCallback(
    async (targetDeductibleId: string) => {
      await assignBackgroundCheckTemplate.mutateAsync({
        deductibleId: targetDeductibleId,
        backgroundCheckTemplateIds: selectedBackgroundCheckTemplateIds,
      });
    },
    [assignBackgroundCheckTemplate, selectedBackgroundCheckTemplateIds],
  );

  const basicDataResetKey = isOpen
    ? `${isPersisted ? (effectiveDeductibleId ?? "edit") : "new"}-v${hydrationVersion}`
    : "closed";

  const isFormDataReady = !isEdit || isEditStateHydrated;

  const flushBasicDataStep = useCallback(async () => {
    if (step !== "basic") return true;
    const valid = await basicDataRef.current?.flushToParent();
    return valid !== false;
  }, [step]);

  const validatePaymentStep = useCallback(async () => {
    if (!shouldIncludePaymentStep || step !== "payment") return paymentFormValues;
    const values = await paymentInfoApiRef.current?.validateAndGetValues();
    if (!values) return null;
    setPaymentFormValues(values);
    return values;
  }, [paymentFormValues, shouldIncludePaymentStep, step]);

  const canProceed = useMemo(() => isFranchiseStepProceedable({
    step,
    state,
    billingModels,
    isPaymentStepLoading,
    selectedBackgroundCheckTemplateIds,
    canListProducts,
    canListBackgroundCheckTemplates,
  }), [
    state,
    step,
    billingModels,
    isPaymentStepLoading,
    selectedBackgroundCheckTemplateIds,
    canListProducts,
    canListBackgroundCheckTemplates,
  ]);

  const handleSave = async (options?: {
    skipSourcesSync?: boolean;
    closeOnSuccess?: boolean;
  }): Promise<boolean> => {
    const closeOnSuccess = options?.closeOnSuccess ?? true;

    if (!(await flushBasicDataStep())) {
      return false;
    }

    let paymentValues = paymentFormValues;
    if (shouldIncludePaymentStep && step === "payment") {
      const validatedPaymentValues = await validatePaymentStep();
      if (!validatedPaymentValues) return false;
      paymentValues = validatedPaymentValues;
    }

    const payload = buildPayload();

    try {
      let targetDeductibleId = effectiveDeductibleId;

      if (targetDeductibleId) {
        await updateDeductible({
          clientId,
          contractId,
          deductibleId: targetDeductibleId,
          data: payload,
        });
      } else {
        const created = await createDeductible({
          clientId,
          contractId,
          data: payload,
        });
        targetDeductibleId = created.id;
        setPersistedDeductibleId(created.id);
      }

      const currentProfitCenter = profitCenterStateRef.current;
      if (targetDeductibleId && !payload.isTest && currentProfitCenter.profitCenterId) {
        await saveDeductibleProfitCenter.mutateAsync({
          clientId,
          contractId,
          deductibleId: targetDeductibleId,
          data: {
            profitCenterId: currentProfitCenter.profitCenterId,
            overageProfitCenterId: currentProfitCenter.overageProfitCenterId || null,
          },
        });
      }

      if (shouldIncludePaymentStep && targetDeductibleId && paymentValues) {
        await saveDeductiblePaymentInfo.mutateAsync({
          clientId,
          contractId,
          deductibleId: targetDeductibleId,
          data: buildPaymentInfoPayload({ formValues: paymentValues }),
        });
      }

      if (
        !hasSelectedBgcProduct &&
        !options?.skipSourcesSync &&
        step === lastStep &&
        targetDeductibleId
      ) {
        setIsSavingSources(true);
        await syncSourcesLinks(targetDeductibleId, isPersisted);
      }

      if (
        hasSelectedBgcProduct &&
        !options?.skipSourcesSync &&
        step === lastStep &&
        targetDeductibleId
      ) {
        await syncBackgroundCheckTemplate(targetDeductibleId);
      }

      if (closeOnSuccess) {
        resetDrawer();
      }

      return true;
    } catch {
      addToast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a franquia. Tente novamente.",
        color: "danger",
      });
      return false;
    } finally {
      setIsSavingSources(false);
    }
  };

  const handlePrimaryAction = async () => {
    if (step === lastStep) {
      await handleSave();
      return;
    }

    if (!(await flushBasicDataStep())) {
      return;
    }

    if (step === "billing" && billingStepRef.current) {
      const isBillingValid = await billingStepRef.current.validate();
      if (!isBillingValid) return;
    }

    if (step === "payment" && !(await validatePaymentStep())) {
      return;
    }

    if (shouldPersistFranchiseOnStepProceed(step, isPersisted)) {
      const saved = await handleSave({ skipSourcesSync: true, closeOnSuccess: false });
      if (!saved) {
        return;
      }
    }

    setStep(steps[currentStepIndex + 1]);
  };

  const renderStep = () => {
    if (isLoadingDeductible || !isFormDataReady) {
      return (
        <div className="flex justify-center py-12">
          <p className="text-default-500">Carregando dados da franquia...</p>
        </div>
      );
    }

    return (
      <>
        <div className={step === "basic" ? "" : "hidden"}>
          <FranchiseStepBasicDataNew
            ref={basicDataRef}
            state={state}
            onStateChange={mergeDeductibleState}
            isEdit={isPersisted}
            resetKey={basicDataResetKey}
            clientIsTest={clientIsTest}
            profitCenterOptions={profitCenterOptions}
            profitCenterState={profitCenterState}
            onProfitCenterChange={handleProfitCenterChange}
            isLoadingProfitCenters={isLoadingProfitCenters}
            canListProducts={canListProducts}
          />
        </div>
        {step === "payment" &&
          (isPaymentStepLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" color="primary" />
            </div>
          ) : (
            <div className="space-y-7">
              <h3 className="text-xl font-medium text-default-500">Informações de pagamento</h3>
              <PaymentInfoForm
                id="deductible-payment-info-form"
                apiRef={paymentInfoApiRef}
                defaultValues={paymentInfoDefaultValues}
                showProfitCenterFields={false}
              />
            </div>
          ))}
        {step === "billing" && (
          <FranchiseStepBillingNew
            ref={billingStepRef}
            state={state}
            onStateChange={mergeDeductibleState}
            contractMinimumValue={contractMinimumValue}
          />
        )}
        {step === "sources" &&
          (isLoadingLinkedSourcesStep ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" color="primary" />
            </div>
          ) : (
            <FranchiseStepSourcesNew
              productIds={selectedProductIds}
              state={sourcesStep}
              onStateChange={updateSourcesStep}
              canListDataSources={canListDataSources}
              canListDataSourceBundles={canListDataSourceBundles}
            />
          ))}
        {step === "templates" &&
          (isLoadingLinkedTemplates ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" color="primary" />
            </div>
          ) : (
            <FranchiseStepBackgroundCheckTemplateNew
              selectedTemplateIds={selectedBackgroundCheckTemplateIds}
              onTemplateChange={setSelectedBackgroundCheckTemplateIds}
              canListTemplates={canListBackgroundCheckTemplates}
            />
          ))}
      </>
    );
  };

  return (
    <DynamicDrawer
      size="3xl"
      title={
        step === "templates"
          ? "Modelo Background Check"
          : showEditWizardChrome
            ? "Editar franquia"
            : "Nova franquia"
      }
      isOpen={isOpen}
      onOpenChange={(open) => !open && resetDrawer()}
      classNames={{ body: "flex-1! mb-0", footer: "border-t-0" }}
      component={renderStep()}
      footer={
        <div className="w-full flex justify-end gap-2">
          {currentStepIndex > 0 && (
            <Button
              variant="light"
              className="border border-default-300"
              onPress={() => setStep(steps[currentStepIndex - 1])}
              isDisabled={isPending}
            >
              Voltar
            </Button>
          )}
          {showEditWizardChrome && step !== lastStep && (
            <Button
              variant="light"
              className="border border-default-300"
              isLoading={isPending}
              isDisabled={isPending}
              onPress={() => void handleSave({ skipSourcesSync: true })}
            >
              Salvar e sair
            </Button>
          )}
          <Button
            color="primary"
            isLoading={isPending}
            onPress={() => {
              void handlePrimaryAction();
            }}
            isDisabled={
              isPending ||
              ((step !== "basic" && step !== "billing") && !canProceed)
            }
          >
            {getFranchisePrimaryActionLabel(step, step === lastStep, showEditWizardChrome)}
          </Button>
        </div>
      }
    />
  );
}
