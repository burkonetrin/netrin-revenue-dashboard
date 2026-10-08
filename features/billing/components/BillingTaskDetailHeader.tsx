"use client";

import { BillingTaskBreadcrumbs } from "./BillingTaskBreadcrumbs";

interface BillingTaskDetailHeaderProps {
  taskId: string;
}

export function BillingTaskDetailHeader({ taskId }: BillingTaskDetailHeaderProps) {
  return (
    <header className="mb-3 space-y-5">
      <BillingTaskBreadcrumbs />
      <p className="text-base font-semibold text-gray-900">Task {taskId}</p>
    </header>
  );
}
