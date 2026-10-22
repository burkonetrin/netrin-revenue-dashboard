"use client";

import { Button } from "@heroui/react";
import { useMemo, useState, type ReactNode } from "react";
import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { FieldInput } from "@/design-system/ui";
import { maskCurrency } from "@/shared/utils/currency";
import { CLIENT_GOAL_SALES_REPS } from "../../clientesDashboardMockData";

const CURRENCY_PLACEHOLDER = "R$ 0,00";

type GoalPair = {
  receitaGeral: string;
  mrr: string;
};

function emptyGoalPair(): GoalPair {
  return { receitaGeral: "", mrr: "" };
}

function initialSalesRepGoals(): Record<string, GoalPair> {
  return Object.fromEntries(
    CLIENT_GOAL_SALES_REPS.map((rep) => [rep.id, emptyGoalPair()]),
  );
}

function GoalsSectionTitle({ children }: { children: ReactNode }) {
  return <h4 className="m-0 text-sm font-normal text-gray-600">{children}</h4>;
}

function GoalPairFields({
  receitaGeral,
  mrr,
  onReceitaGeralChange,
  onMrrChange,
}: {
  receitaGeral: string;
  mrr: string;
  onReceitaGeralChange: (value: string) => void;
  onMrrChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FieldInput
        label="Receita geral"
        labelPlacement="outside"
        placeholder={CURRENCY_PLACEHOLDER}
        inputMode="decimal"
        value={receitaGeral}
        onValueChange={(value) => onReceitaGeralChange(maskCurrency(value))}
      />
      <FieldInput
        label="MRR"
        labelPlacement="outside"
        placeholder={CURRENCY_PLACEHOLDER}
        inputMode="decimal"
        value={mrr}
        onValueChange={(value) => onMrrChange(maskCurrency(value))}
      />
    </div>
  );
}

interface ClientesGoalsDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  competenceLabel: string;
}

export function ClientesGoalsDrawer({
  isOpen,
  onOpenChange,
  competenceLabel,
}: ClientesGoalsDrawerProps) {
  const [companyGoals, setCompanyGoals] = useState<GoalPair>(emptyGoalPair);
  const [salesRepGoals, setSalesRepGoals] = useState(initialSalesRepGoals);

  const salesReps = useMemo(() => CLIENT_GOAL_SALES_REPS, []);

  const drawerBody = (
    <div className="flex flex-col gap-6 pb-2">
      <section>
        <GoalsSectionTitle>Meta da empresa</GoalsSectionTitle>
        <div className="mt-3">
          <GoalPairFields
            receitaGeral={companyGoals.receitaGeral}
            mrr={companyGoals.mrr}
            onReceitaGeralChange={(value) =>
              setCompanyGoals((prev) => ({ ...prev, receitaGeral: value }))
            }
            onMrrChange={(value) =>
              setCompanyGoals((prev) => ({ ...prev, mrr: value }))
            }
          />
        </div>
      </section>

      {salesReps.map((rep) => {
        const goals = salesRepGoals[rep.id] ?? emptyGoalPair();
        return (
          <section key={rep.id}>
            <GoalsSectionTitle>Meta de {rep.label}</GoalsSectionTitle>
            <div className="mt-3">
              <GoalPairFields
                receitaGeral={goals.receitaGeral}
                mrr={goals.mrr}
                onReceitaGeralChange={(value) =>
                  setSalesRepGoals((prev) => ({
                    ...prev,
                    [rep.id]: {
                      ...(prev[rep.id] ?? emptyGoalPair()),
                      receitaGeral: value,
                    },
                  }))
                }
                onMrrChange={(value) =>
                  setSalesRepGoals((prev) => ({
                    ...prev,
                    [rep.id]: {
                      ...(prev[rep.id] ?? emptyGoalPair()),
                      mrr: value,
                    },
                  }))
                }
              />
            </div>
          </section>
        );
      })}
    </div>
  );

  return (
    <DynamicDrawer
      size="lg"
      title="Configurar meta"
      subtitle={
        <h3 className="m-0 text-base font-normal text-gray-600">
          {competenceLabel}
        </h3>
      }
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        base: "max-w-[504px]",
        header: "font-bold text-gray-950",
        body: "flex-1! mb-0",
        footer: "border-t-0 pb-0!",
      }}
      component={drawerBody}
      footer={
        <div className="flex w-full gap-2.5">
          <Button
            variant="light"
            onPress={() => onOpenChange(false)}
            className="h-10 flex-1 border border-gray-300"
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            className="h-10 flex-1"
            onPress={() => onOpenChange(false)}
          >
            Salvar
          </Button>
        </div>
      }
    />
  );
}
