"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button, Radio, RadioGroup } from "@heroui/react";
import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import type { MockClient } from "../../clientesDashboardMockData";
import {
  clientSidebarNotes,
  excedenteDestinoLabel,
  fmtDetail,
} from "../../clientesDashboardMockFormat";
import { NfeNotesListContent } from "./NfeNotesListContent";

export type ClientWorkflowKind =
  | "pagamento-excedente"
  | "ver-notas-fiscais";

const ACTION_TO_KIND: Record<string, ClientWorkflowKind> = {
  "Ver pagamento excedente": "pagamento-excedente",
  "Ver notas fiscais": "ver-notas-fiscais",
};

export function clientActionToWorkflowKind(
  action: string,
): ClientWorkflowKind | null {
  return ACTION_TO_KIND[action] ?? null;
}

interface ClientWorkflowSidebarsProps {
  client: MockClient | null;
  kind: ClientWorkflowKind | null;
  onClose: () => void;
}

function WorkflowFooter({
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex w-full gap-2.5">
      <Button
        variant="light"
        onPress={onCancel}
        className="h-10 flex-1 border border-gray-300"
      >
        {cancelLabel}
      </Button>
      <Button color="primary" onPress={onConfirm} className="h-10 flex-1">
        {confirmLabel}
      </Button>
    </div>
  );
}

export function ClientWorkflowSidebars({
  client,
  kind,
  onClose,
}: ClientWorkflowSidebarsProps) {
  const [excedenteOption, setExcedenteOption] = useState<
    "reembolsado" | "abatido"
  >("reembolsado");

  const open = Boolean(client && kind);
  const notes = useMemo(
    () => (client ? clientSidebarNotes(client) : []),
    [client],
  );

  useEffect(() => {
    if (open) {
      setExcedenteOption(client?.pagamentoExcedente?.destino ?? "reembolsado");
    }
  }, [open, kind, client?.id, client?.pagamentoExcedente?.destino]);

  const excedente = client?.pagamentoExcedente ?? {
    valor: 3_280,
    notaDescricao: notes[0]?.nome ?? "—",
    destino: "reembolsado" as const,
  };
  const excedenteFranquia =
    excedente.notaDescricao || notes[0]?.nome || "—";

  let title = "";
  let subtitle: string | undefined;
  let body: ReactNode = null;
  let cancelLabel = "Cancelar";
  let confirmLabel = "Salvar";

  switch (kind) {
    case "pagamento-excedente":
      title = "Ver pagamento excedente";
      body = (
        <>
          <p className="text-sm text-zinc-500 mb-4">
            Pagamento excedente de {fmtDetail(excedente.valor)} referente à
            franquia {excedenteFranquia}.
          </p>
          <RadioGroup
            value={excedenteOption}
            onValueChange={(v) =>
              setExcedenteOption(v as "reembolsado" | "abatido")
            }
          >
            <Radio value="reembolsado">
              {excedenteDestinoLabel("reembolsado")}
            </Radio>
            <Radio value="abatido">
              {excedenteDestinoLabel("abatido")}
            </Radio>
          </RadioGroup>
        </>
      );
      break;
    case "ver-notas-fiscais":
      title = "Ver notas fiscais";
      subtitle = client?.nome;
      body = (
        <div className="text-[13px]">
          <NfeNotesListContent notes={notes} />
        </div>
      );
      break;
    default:
      break;
  }

  return (
    <DynamicDrawer
      size="lg"
      title={title}
      subtitle={subtitle}
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      classNames={{
        base: "max-w-[504px]",
        header: "font-bold text-gray-950",
        body: "flex-1! mb-0",
        footer: "border-t-0",
      }}
      component={body}
      footer={
        kind === "ver-notas-fiscais" ? (
          <Button
            variant="light"
            onPress={onClose}
            className="h-10 w-full border border-gray-300"
          >
            Fechar
          </Button>
        ) : kind ? (
          <WorkflowFooter
            cancelLabel={cancelLabel}
            confirmLabel={confirmLabel}
            onCancel={onClose}
            onConfirm={onClose}
          />
        ) : null
      }
    />
  );
}
