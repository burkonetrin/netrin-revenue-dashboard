"use client";

import {
  Button,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { useMemo, useState } from "react";
import {
  INVOICE_STATUS_FILTER_OPTIONS,
  MOCK_COMPETENCE_MONTHS,
} from "../../clientesDashboardMockData";

export interface FilterDrawerStatus {
  ativo: boolean;
  inativo: boolean;
}

const DEFAULT_COMPARE_KEYS = new Set(["maior"]);
const DEFAULT_COMPETENCE_FROM = new Set(["2025-07"]);
const DEFAULT_COMPETENCE_TO = new Set(["2025-09"]);

interface ClientesFilterDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  statusFilter: FilterDrawerStatus;
  onStatusFilterChange: (next: FilterDrawerStatus) => void;
  onApply: () => void;
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

  const clearAll = () => {
    setCheckboxIds({});
    onStatusFilterChange({ ativo: false, inativo: false });
  };

  const toggleCheck = (id: string, checked: boolean) => {
    setCheckboxIds((prev) => ({ ...prev, [id]: checked }));
  };

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="right"
      size="md"
      isDismissable
      classNames={{
        wrapper: "z-[10070]",
        backdrop: "z-[10065]",
      }}
    >
      <DrawerContent>
        <DrawerHeader className="flex items-center justify-between border-b border-zinc-200">
          <span className="text-[22px] font-semibold">Filtros</span>
        </DrawerHeader>
        <DrawerBody className="gap-6">
          <section>
            <p className="text-[13px] font-semibold mb-2.5">Competência</p>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Competência inicial"
                size="sm"
                defaultSelectedKeys={DEFAULT_COMPETENCE_FROM}
              >
                {competenceItems.map((m) => (
                  <SelectItem key={m.key}>{m.label}</SelectItem>
                ))}
              </Select>
              <Select
                label="Competência final"
                size="sm"
                defaultSelectedKeys={DEFAULT_COMPETENCE_TO}
              >
                {competenceItems.map((m) => (
                  <SelectItem key={m.key}>{m.label}</SelectItem>
                ))}
              </Select>
            </div>
          </section>
          <section>
            <p className="text-[13px] font-semibold mb-2.5">Tipo</p>
            <div className="flex flex-col gap-2.5">
              <Checkbox
                isSelected={checkboxIds.tipoBase}
                onValueChange={(v) => toggleCheck("tipoBase", v)}
              >
                Base
              </Checkbox>
              <Checkbox
                isSelected={checkboxIds.tipoNovos}
                onValueChange={(v) => toggleCheck("tipoNovos", v)}
              >
                Novos negócios
              </Checkbox>
            </div>
          </section>
          <section>
            <p className="text-[13px] font-semibold mb-2.5">Status</p>
            <div className="flex flex-col gap-2.5">
              <Checkbox
                isSelected={statusFilter.ativo}
                onValueChange={(v) =>
                  onStatusFilterChange({ ...statusFilter, ativo: v })
                }
              >
                Ativo
              </Checkbox>
              <Checkbox
                isSelected={statusFilter.inativo}
                onValueChange={(v) =>
                  onStatusFilterChange({ ...statusFilter, inativo: v })
                }
              >
                Inativo
              </Checkbox>
            </div>
          </section>
          <section>
            <p className="text-[13px] font-semibold mb-2.5">Centros de lucro</p>
            <div className="flex flex-col gap-2.5">
              {["Juliana", "Matheus", "Junior Duraes", "Maria Luiza"].map(
                (name) => (
                  <Checkbox
                    key={name}
                    isSelected={checkboxIds[`cl_${name}`]}
                    onValueChange={(v) => toggleCheck(`cl_${name}`, v)}
                  >
                    {name}
                  </Checkbox>
                ),
              )}
            </div>
          </section>
          <section>
            <p className="text-[13px] font-semibold mb-2.5">Produtos</p>
            <div className="flex flex-col gap-2.5">
              {[
                "Background Check",
                "IDV",
                "Monitoramento",
                "Workflow",
                "API",
              ].map((name) => (
                <Checkbox
                  key={name}
                  isSelected={checkboxIds[`prod_${name}`]}
                  onValueChange={(v) => toggleCheck(`prod_${name}`, v)}
                >
                  {name}
                </Checkbox>
              ))}
            </div>
          </section>
          <section>
            <p className="text-[13px] font-semibold mb-2.5">Saúde do cliente</p>
            <div className="flex flex-col gap-2.5">
              {[
                "Risco alto (igual ou menor a 50%)",
                "Risco médio (entre 51% a 90%)",
                "Sucesso (entre 91% a 100%)",
                "Oportunidade (maior que 100%)",
              ].map((label) => (
                <Checkbox
                  key={label}
                  isSelected={checkboxIds[`health_${label}`]}
                  onValueChange={(v) => toggleCheck(`health_${label}`, v)}
                >
                  {label}
                </Checkbox>
              ))}
            </div>
          </section>
          <section>
            <p className="text-[13px] font-semibold mb-2.5">Tags</p>
            <div className="flex flex-col gap-2.5">
              {[
                "Enterprise",
                "Mid-market",
                "SMB",
                "Onboarding",
                "Inadimplente",
              ].map((tag) => (
                <Checkbox
                  key={tag}
                  isSelected={checkboxIds[`tag_${tag}`]}
                  onValueChange={(v) => toggleCheck(`tag_${tag}`, v)}
                >
                  {tag}
                </Checkbox>
              ))}
            </div>
          </section>
          <section>
            <p className="text-[13px] font-semibold mb-2.5">Status da fatura</p>
            <div className="flex flex-col gap-2.5">
              {INVOICE_STATUS_FILTER_OPTIONS.map(({ key, label }) => (
                <Checkbox
                  key={key}
                  isSelected={checkboxIds[`inv_${key}`]}
                  onValueChange={(v) => toggleCheck(`inv_${key}`, v)}
                >
                  {label}
                </Checkbox>
              ))}
            </div>
          </section>
          <section>
            <p className="text-[13px] font-semibold mb-2.5">Método de pagamento</p>
            <div className="flex flex-col gap-2.5">
              <Checkbox
                isSelected={checkboxIds.payBoleto}
                onValueChange={(v) => toggleCheck("payBoleto", v)}
              >
                Boleto
              </Checkbox>
              <Checkbox
                isSelected={checkboxIds.payTransfer}
                onValueChange={(v) => toggleCheck("payTransfer", v)}
              >
                Transferência bancária
              </Checkbox>
            </div>
          </section>
          <section>
            <p className="text-[13px] font-semibold mb-2.5">Upload de arquivos</p>
            <div className="flex flex-col gap-2.5">
              <Checkbox
                isSelected={checkboxIds.uploadSemNota}
                onValueChange={(v) => toggleCheck("uploadSemNota", v)}
              >
                Faturas sem nota anexada
              </Checkbox>
              <Checkbox
                isSelected={checkboxIds.uploadSemBoleto}
                onValueChange={(v) => toggleCheck("uploadSemBoleto", v)}
              >
                Faturas sem boleto anexado
              </Checkbox>
            </div>
          </section>
          <section>
            <p className="text-[13px] font-semibold mb-2.5">Filtros condicionais</p>
            <div className="mb-3">
              <p className="text-xs text-zinc-500 mb-1">Faturamento</p>
              <div className="grid grid-cols-2 gap-3">
                <Select size="sm" defaultSelectedKeys={DEFAULT_COMPARE_KEYS}>
                  <SelectItem key="maior">Maior que</SelectItem>
                  <SelectItem key="menor">Menor que</SelectItem>
                  <SelectItem key="igual">Igual a</SelectItem>
                </Select>
                <Input placeholder="Valor em R$" size="sm" />
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Consumo</p>
              <div className="grid grid-cols-2 gap-3">
                <Select size="sm" defaultSelectedKeys={DEFAULT_COMPARE_KEYS}>
                  <SelectItem key="maior">Maior que</SelectItem>
                  <SelectItem key="menor">Menor que</SelectItem>
                  <SelectItem key="igual">Igual a</SelectItem>
                </Select>
                <Input placeholder="% de consumo" size="sm" />
              </div>
            </div>
          </section>
        </DrawerBody>
        <DrawerFooter className="border-t border-zinc-200 justify-end gap-2">
          <Button variant="bordered" onPress={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="bordered" onPress={clearAll}>
            Limpar filtros
          </Button>
          <Button color="primary" onPress={onApply}>
            Filtrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
