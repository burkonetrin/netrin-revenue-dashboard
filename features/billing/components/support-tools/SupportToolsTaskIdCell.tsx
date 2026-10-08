"use client";

import { BILLING_TASKS_BASE_PATH } from "@/constants";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

export function SupportToolsTaskIdCell({ taskId }: { taskId: string | null | undefined }) {
  if (!taskId?.trim()) {
    return "—";
  }

  const id = taskId.trim();

  return (
    <span className="inline-flex w-max items-center gap-2 whitespace-nowrap">
      <span>{id}</span>
      <Link
        to={`${BILLING_TASKS_BASE_PATH}/${id}`}
        className="inline-flex shrink-0 text-primary hover:opacity-80"
        aria-label={`Ver detalhes da task ${id}`}
      >
        <Eye size={18} strokeWidth={1.75} />
      </Link>
    </span>
  );
}
