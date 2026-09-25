"use client";

import { Chip } from "@heroui/react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { HEALTH_CHIP_COLOR, HEALTH_OPTIONS } from "../constants";
import type { ClientMock } from "../types";
import { formatCnpj, formatCurrency, formatPercent } from "../utils/format";
import CardSourceInfo from "@/shared/components/CardInfos/page";

interface ClientHierarchyCardProps {
  client: ClientMock;
}

function healthLabel(saude: ClientMock["saude"]): string {
  return HEALTH_OPTIONS.find((h) => h.key === saude)?.label ?? saude;
}

export function ClientHierarchyCard({ client }: ClientHierarchyCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <article className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-zinc-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="mt-1 text-zinc-500">
          {expanded ? (
            <ChevronDown className="size-5" />
          ) : (
            <ChevronRight className="size-5" />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <div>
              <span className="text-zinc-500">ID </span>
              <span className="font-medium text-zinc-900">{client.id}</span>
            </div>
            <div>
              <span className="text-zinc-500">CNPJ </span>
              <span className="font-medium text-zinc-900">
                {formatCnpj(client.cnpj)}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">Razão social </span>
              <span className="font-semibold text-zinc-900">
                {client.razaoSocial}
              </span>
            </div>
            <Chip
              size="sm"
              color={HEALTH_CHIP_COLOR[client.saude]}
              variant="flat"
            >
              {healthLabel(client.saude)}
            </Chip>
          </div>
          {expanded ? (
            <div className="mt-4">
              <CardSourceInfo
                columns={4}
                items={[
                  { label: "Data de início do cliente", value: client.dataInicio },
                  {
                    label: "Média de faturamento (últimos 3 meses)",
                    value: formatCurrency(client.mediaFaturamento3m),
                  },
                  {
                    label: "Saúde do cliente",
                    value: healthLabel(client.saude),
                  },
                  {
                    label: "Receita dos últimos 12 meses",
                    value: formatCurrency(client.receita12m),
                  },
                  {
                    label: "Mínimo contratado",
                    value: formatCurrency(client.minimoContratado),
                  },
                  {
                    label: "Faturado por mês",
                    value: formatCurrency(client.faturadoPorMes),
                  },
                  { label: "MRR", value: formatCurrency(client.mrr) },
                  {
                    label: "Consumo médio",
                    value: formatPercent(client.consumoMedioPct),
                  },
                ]}
              />
            </div>
          ) : null}
        </div>
      </button>

      {expanded ? (
        <div className="border-t border-zinc-100 px-4 pb-4 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-800 pt-3">
            Contratos
          </h3>
          {client.contracts.map((contract) => (
            <div
              key={contract.id}
              className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 space-y-3"
            >
              <p className="text-sm font-medium text-primary">
                {contract.name}{" "}
                <span className="text-zinc-500 font-normal">
                  ({contract.id})
                </span>
              </p>
              <CardSourceInfo
                columns={3}
                items={[
                  { label: "Vigência", value: contract.vigencia },
                  {
                    label: "Renovação automática",
                    value: contract.renovacaoAutomatica ? "Sim" : "Não",
                  },
                  {
                    label: "Receita dos últimos 12 meses",
                    value: formatCurrency(contract.receita12m),
                  },
                  {
                    label: "Média de faturamento (últimos 3 meses)",
                    value: formatCurrency(contract.mediaFaturamento3m),
                  },
                  {
                    label: "Mínimo contratado",
                    value: formatCurrency(contract.minimoContratado),
                  },
                  {
                    label: "Consumo médio das franquias (%)",
                    value: formatPercent(contract.consumoMedioFranquiasPct),
                  },
                  { label: "MRR", value: formatCurrency(contract.mrr) },
                ]}
              />

              <div className="space-y-2 pl-2 border-l-2 border-primary-100">
                <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                  Franquias
                </p>
                {contract.franchises.map((fr) => (
                  <div
                    key={fr.id}
                    className="rounded-md bg-white border border-zinc-200 p-3"
                  >
                    <p className="text-sm font-medium text-zinc-900 mb-2">
                      {fr.name}
                    </p>
                    <CardSourceInfo
                      columns={3}
                      items={[
                        { label: "Vigência", value: fr.vigencia },
                        {
                          label: "Renovação automática",
                          value: fr.renovacaoAutomatica ? "Sim" : "Não",
                        },
                        {
                          label: "Média de faturamento (últimos 3 meses)",
                          value: formatCurrency(fr.mediaFaturamento3m),
                        },
                        { label: "Produto", value: fr.produto },
                        { label: "Modelo de cobrança", value: fr.modeloCobranca },
                        { label: "Centro de custo", value: fr.centroCusto },
                        {
                          label: "Consumo médio (%)",
                          value: formatPercent(fr.consumoMedioPct),
                        },
                        {
                          label: "Receita dos últimos 12 meses",
                          value: formatCurrency(fr.receita12m),
                        },
                        { label: "Serviço", value: fr.servico },
                      ]}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
