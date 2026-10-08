"use client";

import { BILLING_TASKS_BASE_PATH } from "@/constants";
import { Button, Spinner, addToast } from "@heroui/react";
import { isAxiosError } from "axios";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBillingTask } from "../hooks/useBillingTask";
import { formatBillingTaskResponseAsJson } from "../utils/billing-task-display.utils";
import { BillingTaskBreadcrumbs } from "./BillingTaskBreadcrumbs";
import { BillingTaskDetailHeader } from "./BillingTaskDetailHeader";

const PAGE_SHELL_CLASS =
  "relative min-h-full space-y-3 bg-white -m-6 md:-m-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] max-w-none p-6 md:p-8";

const TASK_ID_PATTERN = /^[a-zA-Z0-9]{24}$/;

export function BillingTaskDetailPage() {
  const navigate = useNavigate();
  const taskId = useParams().taskId?.trim() ?? "";
  const isValidId = TASK_ID_PATTERN.test(taskId);
  const query = useBillingTask(taskId, isValidId, 1);

  useEffect(() => {
    if (!isValidId && taskId) {
      addToast({ title: "Identificador inválido", color: "warning" });
    }
  }, [isValidId, taskId]);

  if (!taskId || !isValidId) {
    return (
      <div className={PAGE_SHELL_CLASS}>
        <BillingTaskBreadcrumbs className="mb-2" />
        <p className="text-sm text-gray-600">Informe um ID de task válido (24 caracteres alfanuméricos).</p>
        <Button radius="sm" variant="bordered" onPress={() => navigate(BILLING_TASKS_BASE_PATH)}>
          Voltar
        </Button>
      </div>
    );
  }

  if (query.isLoading) {
    return (
      <div className={`${PAGE_SHELL_CLASS} flex min-h-[320px] items-center justify-center`}>
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (query.isError) {
    const isNotFound = isAxiosError(query.error) && query.error.response?.status === 404;
    return (
      <div className={PAGE_SHELL_CLASS}>
        <BillingTaskDetailHeader taskId={taskId} />
        <p className="text-sm text-gray-600">
          {isNotFound
            ? "Task não encontrada para o identificador informado."
            : "Não foi possível carregar os dados da task."}
        </p>
        <div className="flex gap-2">
          <Button radius="sm" variant="bordered" onPress={() => navigate(BILLING_TASKS_BASE_PATH)}>
            Voltar
          </Button>
          {!isNotFound ? (
            <Button radius="sm" color="primary" onPress={() => void query.refetch()}>
              Tentar novamente
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  const json = formatBillingTaskResponseAsJson(query.data!);

  return (
    <div className={PAGE_SHELL_CLASS}>
      <BillingTaskDetailHeader taskId={taskId} />
      <pre
        className="whitespace-pre-wrap rounded-lg bg-default-100 p-6 text-xs leading-[1.4]"
        aria-readonly="true"
      >
        {json}
      </pre>
    </div>
  );
}
