import type { CostManagementLevelResult } from "../types/costManagement.types";

export type FinancialAccordionPanelStatus = "idle" | "loading" | "success" | "empty" | "error";

export interface FinancialAccordionPanelState {
  key: string;
  parentKey: string | null;
  expanded: boolean;
  search: string;
  result: CostManagementLevelResult | null;
  status: FinancialAccordionPanelStatus;
  error: string | null;
  requestVersion: number;
}

export interface FinancialAccordionState {
  panels: Record<string, FinancialAccordionPanelState>;
}

type AccordionAction =
  | { type: "open"; key: string; parentKey: string; canExpand: boolean }
  | { type: "close"; key: string }
  | { type: "loading"; key: string; requestVersion: number }
  | { type: "success"; key: string; requestVersion: number; result: CostManagementLevelResult }
  | { type: "error"; key: string; requestVersion: number; message: string }
  | { type: "set-search"; key: string; search: string }
  | { type: "reset" };

function createPanel(key: string, parentKey: string | null = null): FinancialAccordionPanelState {
  return {
    key,
    parentKey,
    expanded: key === "root",
    search: "",
    result: null,
    status: "idle",
    error: null,
    requestVersion: 0,
  };
}

export function createInitialFinancialAccordionState(): FinancialAccordionState {
  return { panels: { root: createPanel("root") } };
}

function isDescendant(
  panel: FinancialAccordionPanelState,
  ancestorKey: string,
  panels: Record<string, FinancialAccordionPanelState>,
) {
  let current = panel.parentKey;
  while (current) {
    if (current === ancestorKey) return true;
    current = panels[current]?.parentKey ?? null;
  }
  return false;
}

export function financialAccordionReducer(
  state: FinancialAccordionState,
  action: AccordionAction,
): FinancialAccordionState {
  if (action.type === "reset") return createInitialFinancialAccordionState();

  const current = state.panels[action.key];
  if (action.type === "open") {
    if (!action.canExpand) return state;
    return {
      panels: {
        ...state.panels,
        [action.key]: {
          ...(current ?? createPanel(action.key, action.parentKey)),
          parentKey: action.parentKey,
          expanded: true,
          result: null,
          status: "idle",
          error: null,
        },
      },
    };
  }
  if (!current) return state;

  if (action.type === "close") {
    const panels = Object.fromEntries(
      Object.entries(state.panels).filter(
        ([key, panel]) => key !== action.key && !isDescendant(panel, action.key, state.panels),
      ),
    );
    return { panels: { ...panels, [action.key]: { ...current, expanded: false } } };
  }
  if (action.type === "set-search") {
    const panels = Object.fromEntries(
      Object.entries(state.panels).filter(
        ([key, panel]) => key === action.key || !isDescendant(panel, action.key, state.panels),
      ),
    );
    return { panels: { ...panels, [action.key]: { ...current, search: action.search } } };
  }
  if (action.type === "loading") {
    return {
      panels: {
        ...state.panels,
        [action.key]: {
          ...current,
          status: "loading",
          error: null,
          requestVersion: action.requestVersion,
        },
      },
    };
  }
  if (action.requestVersion !== current.requestVersion) return state;
  if (action.type === "success") {
    return {
      panels: {
        ...state.panels,
        [action.key]: {
          ...current,
          result: action.result,
          status: action.result.rows.data.length ? "success" : "empty",
          error: null,
        },
      },
    };
  }
  return {
    panels: {
      ...state.panels,
      [action.key]: { ...current, status: "error", error: action.message },
    },
  };
}

export type { AccordionAction };
