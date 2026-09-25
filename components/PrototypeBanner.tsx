"use client";

/** Faixa visível indicando ambiente de protótipo. */
export function PrototypeBanner() {
  return (
    <div
      className="rounded-lg border border-warning-300 bg-warning-50 px-4 py-2 text-sm text-warning-800"
      role="status"
    >
      <strong>Simulação</strong> — dados e comportamentos fictícios para
      validação de layout e filtros. Não usa login nem API do Nucleus.
    </div>
  );
}
