"use client";

import { Button } from "@heroui/react";
import { useMemo, useState } from "react";
import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { FieldCheckbox, FieldInput, FieldSelect } from "@/design-system/ui";
import {
  INVOICE_STATUS_FILTER_OPTIONS,
  MOCK_COMPETENCE_MONTHS,
} from "../../clientesDashboardMockData";

export interface FilterDrawerStatus {
  ativo: boolean;
  inativo: boolean;
}

interface ClientesFilterDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  statusFilter: FilterDrawerStatus;
  onStatusFilterChange: (next: FilterDrawerStatus) => void;
  onApply: () => void;
}

const COMPARISON_OPERATORS = [
  { key: "maior", label: "Maior que" },
  { key: "menor", label: "Menor que" },
  { key: "igual", label: "Igual a" },
];

function FilterCheckGroup({
  title,
  items,
  checked,
  onToggle,
}: {
  title: string;
  items: { id: string; label: string }[];
  checked: Record<string, boolean>;
  onToggle: (id: string, value: boolean) => void;
}) {
  return (
    <section className="mb-6">
      <span className="ds-section-title">{title}</span>
      <div className="flex flex-col gap-3">
        {items.map(({ id, label }) => (
          <FieldCheckbox
            key={id}
            isSelected={Boolean(checked[id])}
            onValueChange={(value) => onToggle(id, value)}
          >
            {label}
          </FieldCheckbox>
        ))}
      </div>
    </section>
  );
}

export function ClientesFilterDrawer({
  isOpen,
  onOpenChange,
  statusFilter,
  onStatusFilterChange,
  onApply,
}: ClientesFilterDrawerProps) {
  const [checkboxIds, setCheckboxIds] = useState<Record<string, boolean>>({});
  const competenceItems = useMemo(() => MOCK_COMPETENCE_MONTHS, []);
  const competenceOptions = useMemo(
    () => competenceItems.map((m) => ({ key: m.key, label: m.label })),
    [competenceItems],
  );

  const clearAll = () => {
    setCheckboxIds({});
    onStatusFilterChange({ ativo: false, inativo: false });
  };

  const toggleCheck = (id: string, checked: boolean) => {
    setCheckboxIds((prev) => ({ ...prev, [id]: checked }));
  };

  const handleClose = () => onOpenChange(false);

  const filterBody = (
    <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto pr-1">
      <section className="mb-4">
        <span className="ds-section-title">Competência</span>
        <div className="grid grid-cols-2 gap-3">
          <FieldSelect
            label="Competência inicial"
            items={competenceOptions}
            defaultSelectedKeys={new Set(["2025-07"])}
          />
          <FieldSelect
            label="Competência final"
            items={competenceOptions}
            defaultSelectedKeys={new Set(["2025-09"])}
          />
        </div>
      </section>
      <FilterCheckGroup
        title="Tipo"
        checked={checkboxIds}
        onToggle={toggleCheck}
        items={[
          { id: "tipoBase", label: "Base" },
          { id: "tipoNovos", label: "Novos negócios" },
        ]}
      />
      <section className="mb-6">
        <span className="ds-section-title">Status</span>
        <div className="flex flex-col gap-3">
          <FieldCheckbox
            isSelected={statusFilter.ativo}
            onValueChange={(ativo) =>
              onStatusFilterChange({ ...statusFilter, ativo })
            }
          >
            Ativo
          </FieldCheckbox>
          <FieldCheckbox
            isSelected={statusFilter.inativo}
            onValueChange={(inativo) =>
              onStatusFilterChange({ ...statusFilter, inativo })
            }
          >
            Inativo
          </FieldCheckbox>
        </div>
      </section>
      <FilterCheckGroup
        title="Centros de lucro"
        checked={checkboxIds}
        onToggle={toggleCheck}
        items={["Juliana", "Matheus", "Junior Duraes", "Maria Luiza"].map(
          (name) => ({ id: `cl_${name}`, label: name }),
        )}
      />
      <FilterCheckGroup
        title="Produtos"
        checked={checkboxIds}
        onToggle={toggleCheck}
        items={[
          "Background Check",
          "IDV",
          "Monitoramento",
          "Workflow",
          "API",
        ].map((name) => ({ id: `prod_${name}`, label: name }))}
      />
      <FilterCheckGroup
        title="Saúde do cliente"
        checked={checkboxIds}
        onToggle={toggleCheck}
        items={[
          "Risco alto (igual ou menor a 50%)",
          "Risco médio (entre 51% a 90%)",
          "Sucesso (entre 91% a 100%)",
          "Oportunidade (maior que 100%)",
        ].map((label) => ({ id: `health_${label}`, label }))}
      />
      <FilterCheckGroup
        title="Tags"
        checked={checkboxIds}
        onToggle={toggleCheck}
        items={[
          "Enterprise",
          "Mid-market",
          "SMB",
          "Onboarding",
          "Inadimplente",
        ].map((tag) => ({ id: `tag_${tag}`, label: tag }))}
      />
      <FilterCheckGroup
        title="Status da fatura"
        checked={checkboxIds}
        onToggle={toggleCheck}
        items={INVOICE_STATUS_FILTER_OPTIONS.map(({ key, label }) => ({
          id: `inv_${key}`,
          label,
        }))}
      />
      <FilterCheckGroup
        title="Método de pagamento"
        checked={checkboxIds}
        onToggle={toggleCheck}
        items={[
          { id: "payBoleto", label: "Boleto" },
          { id: "payTransfer", label: "Transferência bancária" },
        ]}
      />
      <FilterCheckGroup
        title="Upload de arquivos"
        checked={checkboxIds}
        onToggle={toggleCheck}
        items={[
          { id: "uploadSemNota", label: "Faturas sem nota anexada" },
          { id: "uploadSemBoleto", label: "Faturas sem boleto anexado" },
        ]}
      />
      <section className="mb-2">
        <span className="ds-section-title">Filtros condicionais</span>
        <div className="mb-3">
          <p className="text-xs text-zinc-500 mb-1">Faturamento</p>
          <div className="grid grid-cols-2 gap-3">
            <FieldSelect
              items={COMPARISON_OPERATORS}
              defaultSelectedKeys={new Set(["maior"])}
              aria-label="Operador de faturamento"
            />
            <FieldInput placeholder="Valor em R$" />
          </div>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Consumo</p>
          <div className="grid grid-cols-2 gap-3">
            <FieldSelect
              items={COMPARISON_OPERATORS}
              defaultSelectedKeys={new Set(["maior"])}
              aria-label="Operador de consumo"
            />
            <FieldInput placeholder="% de consumo" />
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <DynamicDrawer
      size="lg"
      title="Filtros"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        base: "max-w-[504px]",
        header: "font-bold text-gray-950",
        body: "flex-1! mb-0",
        footer: "border-t-0",
      }}
      component={filterBody}
      footer={
        <div className="flex w-full gap-2.5 flex-wrap">
          <Button
            variant="light"
            onPress={handleClose}
            className="h-10 flex-1 min-w-[120px] border border-gray-300"
          >
            Cancelar
          </Button>
          <Button
            variant="light"
            onPress={clearAll}
            className="h-10 flex-1 min-w-[120px] border border-gray-300"
          >
            Limpar filtros
          </Button>
          <Button
            color="primary"
            className="h-10 flex-1 min-w-[120px]"
            onPress={() => {
              onApply();
              onOpenChange(false);
            }}
          >
            Filtrar
          </Button>
        </div>
      }
    />
  );
}
