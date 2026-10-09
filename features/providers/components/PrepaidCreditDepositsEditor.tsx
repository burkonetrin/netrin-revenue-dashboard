"use client";

import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { maskCurrency } from "@/shared/utils/currency";
import { Button, Input } from "@heroui/react";
import { CirclePlus, Trash2 } from "lucide-react";
import type { PrepaidCreditDepositDraft } from "../utils/providerPrepaidCompetence.utils";
import { ProviderInvoiceFieldLabel } from "./ProviderInvoiceFieldLabel";

export interface PrepaidCreditDepositsEditorProps {
  value: PrepaidCreditDepositDraft[];
  onChange: (value: PrepaidCreditDepositDraft[]) => void;
  errors?: Partial<Record<string, string>>;
  isDisabled?: boolean;
}

const EMPTY_DEPOSIT: PrepaidCreditDepositDraft = {
  balanceBeforeCredit: "",
  creditAmount: "",
};

const prepaidDepositFieldClassNames = {
  ...defaultInputClassNames,
  base: "w-full",
};

function maskOptionalCurrency(value: string): string {
  return value ? maskCurrency(value) : "";
}

/** Controlled rows for the credit deposits collected in a prepaid competence. */
export function PrepaidCreditDepositsEditor({
  value,
  onChange,
  errors,
  isDisabled = false,
}: PrepaidCreditDepositsEditorProps) {
  const updateDeposit = (
    index: number,
    field: keyof PrepaidCreditDepositDraft,
    nextValue: string,
  ) => {
    onChange(
      value.map((deposit, depositIndex) => {
        return depositIndex === index
          ? { ...deposit, [field]: maskOptionalCurrency(nextValue) }
          : deposit;
      }),
    );
  };

  return (
    <section className="space-y-3" aria-label="Depósitos de crédito">
      {value.length > 0 && (
        <div className="flex items-start gap-3">
          <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
            <ProviderInvoiceFieldLabel isRequired>Saldo antes do crédito</ProviderInvoiceFieldLabel>
            <ProviderInvoiceFieldLabel isRequired>Crédito depositado</ProviderInvoiceFieldLabel>
          </div>
          <div className="w-10 shrink-0" aria-hidden="true" />
        </div>
      )}
      <div className="space-y-3">
        {value.map((deposit, index) => {
          const row = index + 1;
          const balanceField = `creditDeposits.${index}.balanceBeforeCredit`;
          const creditField = `creditDeposits.${index}.creditAmount`;

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: draft rows have no persistent ID; values stay controlled by their ordered array.
            <div key={index} className="flex items-start gap-3">
              <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  aria-label={`Saldo antes do crédito ${row}`}
                  placeholder="R$ 0,00"
                  value={deposit.balanceBeforeCredit}
                  onValueChange={(nextValue) =>
                    updateDeposit(index, "balanceBeforeCredit", nextValue)
                  }
                  isRequired
                  isDisabled={isDisabled}
                  isInvalid={Boolean(errors?.[balanceField])}
                  errorMessage={errors?.[balanceField]}
                  radius="sm"
                  classNames={prepaidDepositFieldClassNames}
                />
                <Input
                  aria-label={`Crédito depositado ${row}`}
                  placeholder="R$ 0,00"
                  value={deposit.creditAmount}
                  onValueChange={(nextValue) => updateDeposit(index, "creditAmount", nextValue)}
                  isRequired
                  isDisabled={isDisabled}
                  isInvalid={Boolean(errors?.[creditField])}
                  errorMessage={errors?.[creditField]}
                  radius="sm"
                  classNames={prepaidDepositFieldClassNames}
                />
              </div>
              <div className="flex w-10 shrink-0 justify-center">
                {index === value.length - 1 && (
                  <Button
                    type="button"
                    isIconOnly
                    variant="light"
                    color="danger"
                    radius="sm"
                    aria-label={`Excluir depósito ${row}`}
                    isDisabled={isDisabled}
                    onPress={() =>
                      onChange(value.filter((_, depositIndex) => depositIndex !== index))
                    }
                  >
                    <Trash2 size={18} />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="light"
        color="primary"
        radius="sm"
        startContent={<CirclePlus size={18} />}
        isDisabled={isDisabled}
        onPress={() => onChange([...value, { ...EMPTY_DEPOSIT }])}
      >
        Novo depósito de crédito
      </Button>
    </section>
  );
}
