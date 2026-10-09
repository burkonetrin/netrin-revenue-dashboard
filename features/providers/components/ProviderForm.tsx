"use client";

import { Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import type { ProviderFormState, ProviderType } from "../types/providers.types";
import {
  type ProviderFormErrors,
  createEmptyProviderFormState,
  validateProviderForm,
} from "../utils/providerForm.utils";
import { ProviderDirectSourcesSection } from "./ProviderDirectSourcesSection";
import { ProviderFormBasicFields } from "./ProviderFormBasicFields";
import { ProviderIndirectServiceSection } from "./ProviderIndirectServiceSection";
import { ProviderIndirectUsagesSection } from "./ProviderIndirectUsagesSection";

export const PROVIDER_FORM_ID = "provider-form";

export interface ProviderFormProps {
  mode: "create" | "edit";
  /** Estado hidratado (edit) ou vazio (create). */
  initialState?: ProviderFormState;
  onSubmit: (state: ProviderFormState) => void | Promise<void>;
  isSubmitting?: boolean;
  /** Loading do GET detalhe em edit. */
  isLoading?: boolean;
}

function clearOppositeTypeSections(
  state: ProviderFormState,
  nextType: ProviderType,
): ProviderFormState {
  if (nextType === "direct") {
    return {
      ...state,
      providerType: "direct",
      service: "",
      usedByDirectProviders: false,
      usagesByProviderId: {},
    };
  }

  return {
    ...state,
    providerType: "indirect",
    linkedSources: [],
    usesIndirectProviders: false,
    usagesByProviderId: {},
  };
}

/**
 * Orquestra create/edit de fornecedor com seções condicionais (SUP-04..08).
 * Ações Cancelar/Salvar ficam no `footer` do DynamicDrawer (padrão billing).
 */
export function ProviderForm({
  mode,
  initialState,
  onSubmit,
  isLoading = false,
}: ProviderFormProps) {
  const [form, setForm] = useState<ProviderFormState>(
    () => initialState ?? createEmptyProviderFormState(),
  );
  const [errors, setErrors] = useState<ProviderFormErrors>({});
  const [showSourceError, setShowSourceError] = useState(false);

  useEffect(() => {
    if (initialState) {
      setForm(initialState);
      setErrors({});
      setShowSourceError(false);
    }
  }, [initialState]);

  const patchForm = (patch: Partial<ProviderFormState>) => {
    setForm((prev) => {
      if (
        patch.providerType !== undefined &&
        patch.providerType !== "" &&
        patch.providerType !== prev.providerType &&
        mode === "create"
      ) {
        return clearOppositeTypeSections(prev, patch.providerType);
      }
      return { ...prev, ...patch };
    });
  };

  const handleSave = async () => {
    const nextErrors = validateProviderForm(form);
    setErrors(nextErrors);
    setShowSourceError(Boolean(nextErrors.linkedSources));

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit(form);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <form
      id={PROVIDER_FORM_ID}
      className="flex flex-col gap-6 font-sans"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSave();
      }}
    >
      <ProviderFormBasicFields
        name={form.name}
        isPrepaid={form.isPrepaid}
        providerType={form.providerType}
        mode={mode}
        errors={{ name: errors.name, providerType: errors.providerType }}
        onChange={(patch) => patchForm(patch)}
      />

      <ProviderDirectSourcesSection
        providerType={form.providerType}
        linkedSources={form.linkedSources}
        onLinkedSourcesChange={(linkedSources) => patchForm({ linkedSources })}
        showSourceError={showSourceError}
      />

      <ProviderIndirectUsagesSection
        providerType={form.providerType}
        linkedSources={form.linkedSources}
        usesIndirectProviders={form.usesIndirectProviders}
        onUsesIndirectProvidersChange={(usesIndirectProviders) =>
          patchForm({ usesIndirectProviders })
        }
        usagesByProviderId={form.usagesByProviderId}
        onUsagesByProviderIdChange={(usagesByProviderId) => patchForm({ usagesByProviderId })}
      />

      <ProviderIndirectServiceSection
        providerType={form.providerType}
        service={form.service}
        onServiceChange={(service) => patchForm({ service })}
        usedByDirectProviders={form.usedByDirectProviders}
        onUsedByDirectProvidersChange={(usedByDirectProviders) =>
          patchForm({ usedByDirectProviders })
        }
        usagesByProviderId={form.usagesByProviderId}
        onUsagesByProviderIdChange={(usagesByProviderId) => patchForm({ usagesByProviderId })}
        serviceError={errors.service}
      />
    </form>
  );
}
