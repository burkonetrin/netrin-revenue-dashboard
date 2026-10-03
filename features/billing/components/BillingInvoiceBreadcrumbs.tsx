"use client";

import { BILLING_BASE_PATH } from "@/constants";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/react";
import { Link } from "react-router-dom";

interface BillingInvoiceBreadcrumbsProps {
  className?: string;
}

/**
 * Breadcrumbs padrão das telas de detalhe de fatura.
 */
export function BillingInvoiceBreadcrumbs({ className }: BillingInvoiceBreadcrumbsProps) {
  return (
    <Breadcrumbs className={className}>
      <BreadcrumbItem>
        <Link to={BILLING_BASE_PATH} className="text-gray-400 hover:text-gray-600">
          Faturamento
        </Link>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <span className="text-gray-900">Detalhes da fatura</span>
      </BreadcrumbItem>
    </Breadcrumbs>
  );
}
