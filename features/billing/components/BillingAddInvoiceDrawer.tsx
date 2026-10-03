"use client";

/**
 * Drawer para cadastro de fatura manual com validação por nível de NF do cliente.
 */

import { useClientById } from "@/features/clients/hooks/useClientById";
import { useClientSearch } from "@/features/clients/hooks/useClientSearch";
import { useProfitCenters } from "@/features/clients/hooks/useProfitCenters";
import { formatProfitCenterOptions } from "@/features/clients/utils/paymentInfo.utils";
import { useListContractsByClient } from "@/features/contracts/hooks/useListContractsByClient";
import { useListProducts } from "@/features/products/hooks/useListProducts";
import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { defaultInputClassNames, defaultSelectClassNames } from "@/shared/styles/inputClassNames";
import { getErrorMessage } from "@/shared/utils/errorParser";
import {
  Button,
  Checkbox,
  DatePicker,
  type DateValue,
  Input,
  Select,
  SelectItem,
  Textarea,
  addToast,
} from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useBillingCompetenceDueDate } from "../hooks/useBillingCompetenceDueDate";
import { useCreateManualInvoice } from "../hooks/useCreateManualInvoice";
import type {
  BillingManualInvoiceFieldErrors,
  BillingManualInvoiceFormState,
} from "../types/billing-manual-invoice.types";
import { buildCompetenceMonthOptions } from "../utils/billing-adjustment.utils";
import {
  buildManualInvoicePayload,
  createInitialManualInvoiceForm,
  getFormPatchOnSeparateNoteChange,
  getManualInvoiceVisibleFields,
  parseClientNfeLevel,
  resolveManualInvoicePaymentInfoOwner,
  sortManualInvoiceProducts,
  validateManualInvoiceSubmission,
} from "../utils/billing-manual-invoice.utils";
import { formatBillingCompetence } from "../utils/billing.utils";
import { BillingContractPaymentDueInfo } from "./BillingContractPaymentDueInfo";
import {
  BillingCurrencyAmountInput,
  BillingDrawerFormFooter,
  BillingMonthYearSelect,
  BillingProfitCenterSelect,
  billingDrawerClassNames,
  safeParseDate,
} from "./billing-drawer.shared";

interface BillingAddInvoiceDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess?: () => void;
  presetClient?: { id: string; name: string };
}

/**
 * Drawer para adicionar fatura manual.
 */
export function BillingAddInvoiceDrawer({
  isOpen,
  onOpenChange,
  onSuccess,
  presetClient,
}: BillingAddInvoiceDrawerProps) {
  const [form, setForm] = useState<BillingManualInvoiceFormState>(() =>
    createInitialManualInvoiceForm(),
  );
  const [errors, setErrors] = useState<BillingManualInvoiceFieldErrors>({});
  const [clientQuery, setClientQuery] = useState("");
  const [selectedClientName, setSelectedClientName] = useState("");

  const createManualInvoiceMutation = useCreateManualInvoice();
  const queryClient = useQueryClient();

  const activeClientId = presetClient?.id ?? form.clientId;

  const { data: clientDetail, isLoading: isLoadingClient } = useClientById(
    isOpen ? activeClientId : undefined,
  );
  const { data: profitCenters = [], isLoading: isLoadingProfitCenters } = useProfitCenters();
  const { data: clientSearchResponse, isFetching: isSearchingClients } =
    useClientSearch(clientQuery);
  const { data: productsResponse, isLoading: isLoadingProducts } = useListProducts({
    page: 1,
    limit: 100,
  });
  const { data: contractsResponse, isLoading: isLoadingContracts } = useListContractsByClient(
    isOpen ? activeClientId : undefined,
    { page: 1, pageSize: 100 },
  );

  const clientLevel = useMemo(() => parseClientNfeLevel(clientDetail), [clientDetail]);

  const visibleFields = useMemo(
    () => getManualInvoiceVisibleFields(clientLevel, form.separateNote, Boolean(presetClient)),
    [clientLevel, form.separateNote, presetClient],
  );

  const paymentInfoOwner = resolveManualInvoicePaymentInfoOwner(clientLevel);
  const isSameNoteMode =
    (clientLevel === "client" || clientLevel === "contract") && !form.separateNote;
  // Client unificado: sem select de contrato (BE rejeita vínculo). Contract: após escolher contrato.
  const showPaymentDueInfo =
    isSameNoteMode &&
    Boolean(activeClientId) &&
    (paymentInfoOwner === "client" || Boolean(form.contractId));

  const billingScopeForDue =
    clientLevel === "client" || clientLevel === "contract" ? clientLevel : null;
  const { data: billingDueDate, isLoading: isLoadingBillingDueDate } = useBillingCompetenceDueDate({
    clientId: activeClientId,
    competence: form.competence,
    scope: billingScopeForDue,
    contractId: paymentInfoOwner === "contract" ? form.contractId : undefined,
    enabled: showPaymentDueInfo,
  });

  const competenceOptions = useMemo(
    () => buildCompetenceMonthOptions(form.competence),
    [form.competence],
  );

  const profitCenterOptions = useMemo(
    () => formatProfitCenterOptions(profitCenters),
    [profitCenters],
  );

  const productOptions = useMemo(
    () => sortManualInvoiceProducts(productsResponse?.data ?? []),
    [productsResponse?.data],
  );

  const contractOptions = useMemo(
    () =>
      (contractsResponse?.data ?? []).map((contract) => ({
        id: contract.id,
        clientId: contract.clientId,
        name: contract.name,
      })),
    [contractsResponse?.data],
  );

  const selectedClientLabel = useMemo(() => {
    if (presetClient) return presetClient.name;
    if (selectedClientName) return selectedClientName;
    return clientDetail?.name ?? "";
  }, [clientDetail?.name, presetClient, selectedClientName]);

  const filteredClients = useMemo(
    () => clientSearchResponse?.data ?? [],
    [clientSearchResponse?.data],
  );

  const canShowClientSuggestions = clientQuery.trim().length >= 2;

  const selectedProduct = useMemo(
    () => productOptions.find((product) => product.id === form.productId),
    [form.productId, productOptions],
  );

  useEffect(() => {
    if (!isOpen) return;

    setForm(
      createInitialManualInvoiceForm({
        clientId: presetClient?.id ?? "",
      }),
    );
    setErrors({});
    setClientQuery("");
    setSelectedClientName(presetClient?.name ?? "");
  }, [isOpen, presetClient]);

  const updateForm = (patch: Partial<BillingManualInvoiceFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch) as Array<keyof BillingManualInvoiceFormState>) {
        delete next[key as keyof BillingManualInvoiceFieldErrors];
      }
      return next;
    });
  };

  const handleSeparateNoteChange = (checked: boolean) => {
    updateForm(getFormPatchOnSeparateNoteChange(checked, form));
  };

  const handleClientChange = (clientId: string, clientName: string) => {
    updateForm({
      clientId,
      contractId: "",
      separateNote: false,
      dueDateFull: "",
    });
    setSelectedClientName(clientName);
    setClientQuery("");
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const notifyMissingClientLevel = () => {
    addToast({
      title: "Cliente sem configuração de nota fiscal",
      description: "Configure o nível de unificação de NF do cliente antes de cadastrar a fatura.",
      color: "warning",
      timeout: 5000,
      shouldShowTimeoutProgress: true,
    });
  };

  const notifyUnavailableUnifiedDueDate = (isLoading: boolean) => {
    addToast({
      title: "Vencimento da nota unificada indisponível",
      description: isLoading
        ? "Aguarde carregar o próximo vencimento antes de salvar."
        : "Não encontramos o vencimento do faturamento nesta competência. Confira a competência/contrato ou tente novamente.",
      color: "warning",
      timeout: 5000,
      shouldShowTimeoutProgress: true,
    });
  };

  const handleSubmissionError = async (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 500) {
      await queryClient.invalidateQueries({ queryKey: ["billing"] });
      onSuccess?.();
      handleClose();
      addToast({
        title: "Fatura pode ter sido criada",
        description:
          "O servidor retornou erro, mas a fatura pode ter sido registrada. Confira a listagem antes de tentar de novo.",
        color: "warning",
        timeout: 7000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    addToast({
      title: "Não foi possível criar a fatura",
      description: getErrorMessage(isAxiosError(error) ? error : null, "Tente novamente."),
      color: "danger",
      timeout: 5000,
      shouldShowTimeoutProgress: true,
    });
  };

  const handleSubmit = async () => {
    const validation = validateManualInvoiceSubmission({
      form,
      level: clientLevel,
      hasPresetClient: Boolean(presetClient),
      hasSelectedProduct: Boolean(selectedProduct),
      requiresUnifiedDueDate: isSameNoteMode,
      isLoadingUnifiedDueDate: isLoadingBillingDueDate,
      unifiedDueDate: billingDueDate,
    });

    if (validation.kind === "missing-client-level") {
      notifyMissingClientLevel();
      return;
    }

    if (validation.kind === "field-errors") {
      setErrors(validation.errors);
      return;
    }

    if (validation.kind === "missing-product") {
      setErrors((current) => ({ ...current, productId: "Selecione um produto" }));
      return;
    }

    if (validation.kind === "unified-due-date-unavailable") {
      notifyUnavailableUnifiedDueDate(validation.isLoading);
      return;
    }

    if (!clientLevel || !selectedProduct) return;

    const payload = buildManualInvoicePayload(form, {
      clientId: activeClientId,
      clientName: selectedClientLabel || clientDetail?.name || "",
      nfeUnificationLevel: clientLevel,
      hasPresetClient: Boolean(presetClient),
      productId: form.productId,
      productName: selectedProduct.name,
      contracts: contractOptions,
      unifiedDueDate: isSameNoteMode ? (billingDueDate ?? undefined) : undefined,
    });

    if (!payload) return;

    try {
      await createManualInvoiceMutation.mutateAsync(payload);
      onSuccess?.();
      addToast({
        title: `Fatura adicionada na competência ${formatBillingCompetence(payload.competence)}`,
        color: "success",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
        // HeroUI default is sm:w-[356px]; ! important to beat that fixed width.
        classNames: {
          base: "sm:!w-max sm:min-w-[356px] sm:max-w-2xl",
          title: "whitespace-normal break-words",
          wrapper: "min-w-0 flex-1",
        },
      });
      handleClose();
    } catch (error) {
      await handleSubmissionError(error);
    }
  };

  const isSubmitting = createManualInvoiceMutation.isPending;
  const isFormLoading =
    isLoadingProfitCenters || isLoadingProducts || (Boolean(activeClientId) && isLoadingClient);

  return (
    <DynamicDrawer
      size="lg"
      title="Adicionar fatura"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={billingDrawerClassNames}
      component={
        <div className="flex flex-col gap-6">
          {visibleFields.client ? (
            <div className="space-y-3">
              <Input
                label="Cliente"
                labelPlacement="outside"
                placeholder="Cliente"
                value={clientQuery}
                onValueChange={setClientQuery}
                isRequired
                isInvalid={Boolean(errors.clientId)}
                errorMessage={errors.clientId}
                radius="sm"
                classNames={defaultInputClassNames}
                endContent={<Search size={20} className="text-gray-900" />}
              />

              {form.clientId && selectedClientLabel ? (
                <div className="flex h-12 items-center justify-between rounded-lg bg-zinc-100 px-3 text-sm text-gray-900">
                  <span>{selectedClientLabel}</span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    aria-label="Remover cliente selecionado"
                    onPress={() => {
                      updateForm({ clientId: "" });
                      setSelectedClientName("");
                    }}
                  >
                    <X size={18} />
                  </Button>
                </div>
              ) : null}

              {canShowClientSuggestions && !form.clientId ? (
                <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
                  {isSearchingClients ? (
                    <p className="px-3 py-2 text-sm text-gray-500">Buscando clientes...</p>
                  ) : filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-100"
                        onClick={() => handleClientChange(client.id, client.name)}
                      >
                        {client.name}
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-gray-500">Nenhum cliente encontrado</p>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          <BillingMonthYearSelect
            label="Mês de competência"
            value={form.competence}
            options={competenceOptions}
            onValueChange={(competence) => updateForm({ competence })}
            isInvalid={Boolean(errors.competence)}
            errorMessage={errors.competence}
          />

          {visibleFields.separateNoteCheckbox ? (
            <Checkbox
              isSelected={form.separateNote}
              onValueChange={handleSeparateNoteChange}
              classNames={{ label: "text-sm" }}
            >
              Enviar fatura em uma nota fiscal separada
            </Checkbox>
          ) : null}

          {visibleFields.contract ? (
            <Select
              label="Contrato da nota fiscal"
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
              isLoading={isLoadingContracts}
              isDisabled={!activeClientId || isFormLoading}
              radius="sm"
              className="w-full"
              classNames={defaultSelectClassNames}
            >
              {contractOptions.map((option) => (
                <SelectItem key={option.id} textValue={option.name}>
                  {option.name}
                </SelectItem>
              ))}
            </Select>
          ) : null}

          {showPaymentDueInfo && paymentInfoOwner ? (
            <BillingContractPaymentDueInfo
              owner={paymentInfoOwner}
              billingDueDate={billingDueDate}
              isLoadingBillingDueDate={isLoadingBillingDueDate}
            />
          ) : null}

          {visibleFields.dueDateFull ? (
            <DatePicker
              label="Vencimento da fatura"
              labelPlacement="outside"
              value={safeParseDate(form.dueDateFull)}
              onChange={(date: DateValue | null) => {
                updateForm({ dueDateFull: date?.toString() ?? "" });
              }}
              isRequired
              isInvalid={Boolean(errors.dueDateFull)}
              errorMessage={errors.dueDateFull}
              className="w-full"
              classNames={defaultInputClassNames}
            />
          ) : null}

          <BillingCurrencyAmountInput
            label="Valor da fatura"
            value={form.amount}
            onValueChange={(amount) => updateForm({ amount })}
            isInvalid={Boolean(errors.amount)}
            errorMessage={errors.amount}
          />

          <BillingProfitCenterSelect
            label="Centro de lucro"
            value={form.profitCenter}
            options={profitCenterOptions}
            onValueChange={(profitCenter) => updateForm({ profitCenter })}
            isRequired
            isInvalid={Boolean(errors.profitCenter)}
            errorMessage={errors.profitCenter}
            isLoading={isLoadingProfitCenters}
            isDisabled={isFormLoading}
          />

          <BillingProfitCenterSelect
            label="Centro de lucro excedente (opcional)"
            value={form.excessProfitCenter}
            options={profitCenterOptions}
            onValueChange={(excessProfitCenter) => updateForm({ excessProfitCenter })}
            isLoading={isLoadingProfitCenters}
            isDisabled={isFormLoading}
          />

          <Select
            label="Produto"
            labelPlacement="outside"
            placeholder="Selecione uma opção"
            selectedKeys={form.productId ? [form.productId] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string | undefined;
              updateForm({ productId: selected ?? "" });
            }}
            isRequired
            isInvalid={Boolean(errors.productId)}
            errorMessage={errors.productId}
            isLoading={isLoadingProducts}
            isDisabled={isFormLoading}
            radius="sm"
            className="w-full"
            classNames={defaultSelectClassNames}
          >
            {productOptions.map((product) => (
              <SelectItem key={product.id} textValue={product.name}>
                {product.name}
              </SelectItem>
            ))}
          </Select>

          <Textarea
            label="Descrição da fatura"
            labelPlacement="outside"
            placeholder="Descreva a fatura"
            value={form.description}
            onValueChange={(value) => updateForm({ description: value })}
            isRequired
            isInvalid={Boolean(errors.description)}
            errorMessage={errors.description}
            minRows={4}
            radius="sm"
            classNames={defaultInputClassNames}
          />
        </div>
      }
      footer={
        <BillingDrawerFormFooter
          onCancel={handleClose}
          onSave={handleSubmit}
          saveLabel="Criar fatura"
          isLoading={isSubmitting}
          isSaveDisabled={isFormLoading}
        />
      }
    />
  );
}
