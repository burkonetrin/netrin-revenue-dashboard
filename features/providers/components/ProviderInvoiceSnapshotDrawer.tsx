"use client";

import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { formatCurrency } from "@/shared/utils/currency";
import { type ErrorResponse, getErrorMessage } from "@/shared/utils/errorParser";
import {
  providerDrawerFooterClass,
  providerDrawerSecondaryButtonClass,
} from "@/features/providers/utils/providersTableColumns.shared";
import { Button } from "@heroui/react";
import type { AxiosError } from "axios";
import { useProviderInvoiceDetail } from "../hooks/useProviderInvoiceDetail";
import {
  formatCompetenceMonth,
  formatDayMonthYear,
  formatInvoiceValue,
} from "../utils/providerInvoice.utils";

export interface ProviderInvoiceSnapshotDrawerProps {
  invoiceId?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ProviderInvoiceSnapshotDrawer({
  invoiceId,
  isOpen,
  onOpenChange,
}: ProviderInvoiceSnapshotDrawerProps) {
  const { data, isLoading, error, refetch } = useProviderInvoiceDetail(invoiceId);
  const errorMessage = getErrorMessage((error as AxiosError<ErrorResponse> | null) ?? null);

  const content = isLoading ? (
    <p className="text-sm text-default-500">Carregando dados da fatura...</p>
  ) : errorMessage ? (
    <div className="space-y-3" role="alert">
      <p className="text-sm text-danger-500">{errorMessage}</p>
      <Button size="sm" color="primary" variant="flat" onPress={() => void refetch()}>
        Tentar novamente
      </Button>
    </div>
  ) : !data ? (
    <p className="text-sm text-default-500">Fatura não encontrada.</p>
  ) : (
    <div className="space-y-6 text-sm">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <dt className="text-default-500">Fornecedor</dt>
          <dd className="font-medium text-default-800">{data.providerName}</dd>
        </div>
        <div>
          <dt className="text-default-500">Competência</dt>
          <dd className="font-medium text-default-800">
            {formatCompetenceMonth(data.competenceMonth)}
          </dd>
        </div>
        <div>
          <dt className="text-default-500">Período inicial</dt>
          <dd>{formatDayMonthYear(data.assessmentStartDate)}</dd>
        </div>
        <div>
          <dt className="text-default-500">Período final</dt>
          <dd>{formatDayMonthYear(data.assessmentEndDate)}</dd>
        </div>
        <div>
          <dt className="text-default-500">Valor total</dt>
          <dd>{formatInvoiceValue(data.invoiceTotalValue)}</dd>
        </div>
        <div>
          <dt className="text-default-500">Valor das fontes</dt>
          <dd>{formatInvoiceValue(data.sourcesTotalValue)}</dd>
        </div>
        {data.minimumFranchiseValue ? (
          <div>
            <dt className="text-default-500">Valor mínimo de franquia</dt>
            <dd>{formatInvoiceValue(data.minimumFranchiseValue)}</dd>
          </div>
        ) : null}
      </dl>

      <section aria-labelledby="invoice-snapshot-sources">
        <h3 id="invoice-snapshot-sources" className="mb-3 font-semibold text-default-800">
          Fontes vinculadas
        </h3>
        {data.sources.length === 0 ? (
          <p className="text-default-500">Nenhuma fonte registrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-default-200 text-default-500">
                  <th className="p-2">Fornecedor</th>
                  <th className="p-2">Fonte</th>
                  <th className="p-2 text-right">Qtd. bilhetada</th>
                  <th className="p-2 text-right">Qtd. cobrada</th>
                  <th className="p-2 text-right">Total</th>
                  <th className="p-2 text-right">Por consulta</th>
                </tr>
              </thead>
              <tbody>
                {data.sources.map((source) => (
                  <tr key={source.id} className="border-b border-default-100">
                    <td className="p-2">{source.directProviderName}</td>
                    <td className="p-2">{source.dataSourceName}</td>
                    <td className="p-2 text-right">{source.clientBillableQuantity}</td>
                    <td className="p-2 text-right">{source.providerChargedQuantity ?? "—"}</td>
                    <td className="p-2 text-right">{formatCurrency(source.totalCost)}</td>
                    <td className="p-2 text-right">{formatCurrency(source.unitCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );

  return (
    <DynamicDrawer
      title="Detalhes da fatura"
      size="3xl"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      component={content}
      footer={
        <div className={providerDrawerFooterClass}>
          <Button
            variant="light"
            onPress={() => onOpenChange(false)}
            className={providerDrawerSecondaryButtonClass}
          >
            Fechar
          </Button>
        </div>
      }
      dataTestId="provider-invoice-snapshot-drawer"
    />
  );
}
