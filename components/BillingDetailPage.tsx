"use client";

import { BillingInvoiceBreadcrumbs } from "@/features/billing/components/BillingInvoiceBreadcrumbs";
import { BillingInvoiceDetailPage } from "@/features/billing/components/BillingInvoiceDetailPage";
import { useBillingInvoiceDetail } from "@/features/billing/hooks/useBillingInvoiceDetail";
import { BILLING_BASE_PATH } from "@/constants";
import { PageTitle } from "@/shared/components/PageTitle";
import { FinancialIcon } from "@/shared/components/sidebar/icons";
import { Button, Spinner } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";

export function BillingDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = params?.id;
  const sourceParam = searchParams.get("source");
  const source = sourceParam === "entry" ? "entry" : "invoice";

  const { data: invoice, isLoading, isError, error, refetch, isFetching } =
    useBillingInvoiceDetail({
      id: invoiceId,
      source,
    });

  if (isLoading || (isFetching && !invoice)) {
    return (
      <div className="flex size-full items-center justify-center bg-white -m-6 md:-m-8 p-6">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (isError) {
    const isNotFound = isAxiosError(error) && error.response?.status === 404;

    return (
      <div className="size-full space-y-6 bg-white -m-6 md:-m-8 p-6 md:p-8">
        <BillingInvoiceBreadcrumbs className="mb-6" />

        <div className="flex flex-col gap-4">
          <PageTitle icon={<FinancialIcon color="currentColor" />} label="Detalhes da fatura" />
          <p className="text-sm text-gray-600">
            {isNotFound
              ? "Fatura não encontrada."
              : "Não foi possível carregar os detalhes da fatura."}
          </p>
          <div className="flex gap-2">
            {!isNotFound ? (
              <Button radius="sm" color="primary" variant="flat" onPress={() => refetch()}>
                Tentar novamente
              </Button>
            ) : null}
            <Button
              radius="sm"
              variant="bordered"
              className="w-fit"
              startContent={<ArrowLeft size={18} className="text-gray-400" />}
              onPress={() => navigate(BILLING_BASE_PATH)}
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className="bg-white -m-6 md:-m-8">
      <BillingInvoiceDetailPage invoice={invoice} source={source} />
    </div>
  );
}
