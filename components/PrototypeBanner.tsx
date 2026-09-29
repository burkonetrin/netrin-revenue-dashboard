"use client";

/** Faixa visível indicando ambiente de protótipo. */
export function PrototypeBanner() {
  return (
    <div className="ds-prototype-banner" role="status">
      <strong>Simulação</strong> — dados e comportamentos fictícios para
      validação de layout e filtros. Não usa login nem API do Nucleus.
    </div>
  );
}
