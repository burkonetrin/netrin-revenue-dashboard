import { useCallback, useEffect, useReducer, useRef } from "react";
import type { CostManagementGateway } from "../services/costManagement.gateway";
import {
  type AccordionAction,
  createInitialFinancialAccordionState,
  financialAccordionReducer,
} from "../state/financialAccordion.state";
import type {
  CostManagementLevel,
  CostManagementQuery,
  CostManagementRow,
} from "../types/costManagement.types";
import { buildAccordionChildQuery, resetAccordionQuery } from "../utils/financialAccordion";

export function useFinancialAccordion(
  gateway: CostManagementGateway,
  initialQuery: CostManagementQuery,
) {
  const [state, dispatch] = useReducer(
    financialAccordionReducer,
    undefined,
    createInitialFinancialAccordionState,
  );
  const queries = useRef<Record<string, CostManagementQuery>>({ root: initialQuery });
  const versions = useRef<Record<string, number>>({});
  const searchTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const load = useCallback(
    async (key: string, query: CostManagementQuery) => {
      const requestVersion = (versions.current[key] ?? 0) + 1;
      versions.current[key] = requestVersion;
      queries.current[key] = query;
      dispatch({ type: "loading", key, requestVersion } satisfies AccordionAction);
      try {
        const result = await gateway.getLevel(query);
        dispatch({ type: "success", key, requestVersion, result } satisfies AccordionAction);
      } catch (cause) {
        dispatch({
          type: "error",
          key,
          requestVersion,
          message: cause instanceof Error ? cause.message : "Não foi possível carregar este nível.",
        } satisfies AccordionAction);
      }
    },
    [gateway],
  );

  useEffect(() => {
    dispatch({ type: "reset" });
    queries.current = { root: initialQuery };
    void load("root", initialQuery);
  }, [initialQuery, load]);

  const openPanel = useCallback(
    (key: string, parentKey: string, query: CostManagementQuery, canExpand = true) => {
      dispatch({ type: "open", key, parentKey, canExpand });
      if (canExpand) void load(key, query);
    },
    [load],
  );

  const openChild = useCallback(
    (
      key: string,
      parentKey: string,
      query: CostManagementQuery,
      level: CostManagementLevel,
      row: CostManagementRow,
    ) => {
      openPanel(
        key,
        parentKey,
        buildAccordionChildQuery(query, level, row),
        Boolean(row.isClickable),
      );
    },
    [openPanel],
  );

  const setSearch = useCallback(
    (key: string, search: string) => {
      dispatch({ type: "set-search", key, search });
      const query = queries.current[key];
      if (!query) return;
      clearTimeout(searchTimers.current[key]);
      searchTimers.current[key] = setTimeout(() => void load(key, { ...query, search }), 300);
    },
    [load],
  );

  const setSort = useCallback(
    (key: string, sortBy: string, sortDirection: "asc" | "desc") => {
      const query = queries.current[key];
      if (query) void load(key, { ...query, sortBy, sortDirection });
    },
    [load],
  );

  const retry = useCallback(
    (key: string) => {
      const query = queries.current[key];
      if (query) void load(key, query);
    },
    [load],
  );

  const closePanel = useCallback((key: string) => {
    dispatch({ type: "close", key });
  }, []);

  const reset = useCallback(
    (query: CostManagementQuery = initialQuery) => {
      dispatch({ type: "reset" });
      queries.current = { root: resetAccordionQuery(query) };
      versions.current = {};
      void load("root", queries.current.root);
    },
    [initialQuery, load],
  );

  return { state, openPanel, openChild, closePanel, setSearch, setSort, retry, reset };
}
