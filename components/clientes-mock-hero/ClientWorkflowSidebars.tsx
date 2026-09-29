"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button, Checkbox, Radio, RadioGroup } from "@heroui/react";
import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { FieldTextarea } from "@/design-system/ui";
import type { MockClient } from "../../clientesDashboardMockData";
import {
  clientSidebarNotes,
  excedenteDestinoLabel,
  fmtDetail,
  nfeNoteAriaLabel,
} from "../../clientesDashboardMockFormat";
import { NfeNoteStacked } from "./NfeNoteStacked";
import { NfeNotesListContent } from "./NfeNotesListContent";

export type ClientWorkflowKind =
  | "cancelar-nota"
  | "vincular-pagamento"
  | "baixa-contabil"
  | "pagamento-excedente"
  | "ver-notas-fiscais";

const ACTION_TO_KIND: Record<string, ClientWorkflowKind> = {
  "Cancelar nota": "cancelar-nota",
  "Vincular pagamento não identificado": "vincular-pagamento",
  "Baixa contábil": "baixa-contabil",
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

function NoteRadioGroup({
  notes,
  selectedIndex,
  onSelect,
}: {
  notes: ReturnType<typeof clientSidebarNotes>;
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <RadioGroup
      value={String(selectedIndex)}
      onValueChange={(v) => onSelect(Number(v))}
      classNames={{ label: "text-sm", wrapper: "gap-4" }}
    >
      {notes.map((note, i) => (
        <Radio
          key={i}
          value={String(i)}
          classNames={{
            base: "items-start max-w-full",
            label: "text-sm w-full",
          }}
          aria-label={nfeNoteAriaLabel(note)}
        >
          <NfeNoteStacked note={note} />
        </Radio>
      ))}
    </RadioGroup>
  );
}

function NoteCheckboxList({
  notes,
  selected,
  onToggle,
}: {
  notes: ReturnType<typeof clientSidebarNotes>;
  selected: Set<number>;
  onToggle: (index: number, checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {notes.map((note, i) => (
        <Checkbox
          key={i}
          size="sm"
          isSelected={selected.has(i)}
          onValueChange={(checked) => onToggle(i, checked)}
          aria-label={nfeNoteAriaLabel(note)}
          classNames={{
            base: "items-start max-w-full",
            label: "text-sm w-full",
          }}
        >
          <NfeNoteStacked note={note} />
        </Checkbox>
      ))}
    </div>
  );
}

function WorkflowSectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-semibold text-zinc-900 m-0">{children}</p>
  );
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
  const [selectedNote, setSelectedNote] = useState(0);
  const [cancelReason, setCancelReason] = useState("");
  const [excedenteOption, setExcedenteOption] = useState<
    "reembolsado" | "abatido"
  >("reembolsado");
  const [baixaLancarSelected, setBaixaLancarSelected] = useState<Set<number>>(
    () => new Set(),
  );
  const [baixaRemoverSelected, setBaixaRemoverSelected] = useState<
    Set<number>
  >(() => new Set());

  const open = Boolean(client && kind);
  const notes = useMemo(
    () => (client ? clientSidebarNotes(client) : []),
    [client],
  );

  useEffect(() => {
    if (open) {
      setSelectedNote(0);
      setCancelReason("");
      setExcedenteOption(
        client?.pagamentoExcedente?.destino ?? "reembolsado",
      );
      setBaixaLancarSelected(new Set());
      setBaixaRemoverSelected(new Set());
    }
  }, [open, kind, client?.id, client?.pagamentoExcedente?.destino]);

  const pagamentoNaoId = client?.pagamentoNaoIdentificadoValor ?? 4_520;
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
    case "cancelar-nota":
      title = "Cancelar nota";
      cancelLabel = "Voltar";
      confirmLabel = "Solicitar cancelamento";
      body = (
        <>
          <NoteRadioGroup
            notes={notes}
            selectedIndex={selectedNote}
            onSelect={setSelectedNote}
          />
          <FieldTextarea
            label="Motivo de cancelamento"
            value={cancelReason}
            onValueChange={setCancelReason}
            minRows={4}
            className="mt-4"
          />
        </>
      );
      break;
    case "vincular-pagamento":
      title = "Vincular pagamento não identificado";
      cancelLabel = "Cancelar";
      confirmLabel = "Vincular pagamento";
      body = (
        <>
          <WorkflowSectionTitle>Valor do pagamento</WorkflowSectionTitle>
          <p className="text-sm text-zinc-700 mt-1 mb-6">
            {fmtDetail(pagamentoNaoId)}
          </p>
          <WorkflowSectionTitle>
            Vincular pagamento a uma nota disponível
          </WorkflowSectionTitle>
          <div className="mt-3">
            <NoteRadioGroup
              notes={notes}
              selectedIndex={selectedNote}
              onSelect={setSelectedNote}
            />
          </div>
        </>
      );
      break;
    case "baixa-contabil":
      title = "Baixa contábil";
      confirmLabel = "Salvar";
      body = (
        <>
          <WorkflowSectionTitle>Lançar baixa contábil</WorkflowSectionTitle>
          <div className="mt-3 mb-6">
            <NoteCheckboxList
              notes={notes}
              selected={baixaLancarSelected}
              onToggle={(index, checked) => {
                setBaixaLancarSelected((prev) => {
                  const next = new Set(prev);
                  if (checked) next.add(index);
                  else next.delete(index);
                  return next;
                });
              }}
            />
          </div>
          <WorkflowSectionTitle>Remover da baixa contábil</WorkflowSectionTitle>
          <div className="mt-3">
            <NoteCheckboxList
              notes={notes}
              selected={baixaRemoverSelected}
              onToggle={(index, checked) => {
                setBaixaRemoverSelected((prev) => {
                  const next = new Set(prev);
                  if (checked) next.add(index);
                  else next.delete(index);
                  return next;
                });
              }}
            />
          </div>
        </>
      );
      break;
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

interface BillClientsConfirmModalProps {
  open: boolean;
  clientCount: number;
  competenceLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function BillClientsConfirmModal({
  open,
  clientCount,
  competenceLabel,
  onClose,
  onConfirm,
}: BillClientsConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={open}
      onClose={onClose}
      title="Faturar clientes"
      description={
        <p className="text-sm text-zinc-700 m-0">
          Faturando {clientCount} clientes para a competência {competenceLabel}
        </p>
      }
      confirmLabel="Faturar clientes"
      onConfirm={() => {
        onConfirm();
        onClose();
      }}
    />
  );
}
