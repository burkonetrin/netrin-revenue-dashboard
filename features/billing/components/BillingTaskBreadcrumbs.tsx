"use client";

import { BILLING_TASKS_BASE_PATH } from "@/constants";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/react";
import { Link } from "react-router-dom";

interface BillingTaskBreadcrumbsProps {
  className?: string;
}

export function BillingTaskBreadcrumbs({ className }: BillingTaskBreadcrumbsProps) {
  return (
    <Breadcrumbs className={className}>
      <BreadcrumbItem>
        <Link to={BILLING_TASKS_BASE_PATH} className="text-gray-400 hover:text-gray-600">
          Ferramentas de suporte
        </Link>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <span className="text-gray-900">Detalhes da task</span>
      </BreadcrumbItem>
    </Breadcrumbs>
  );
}
