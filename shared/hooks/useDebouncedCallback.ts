"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Encapsula uma função com debounce, com suporte a flush e cancelamento.
 *
 * @param fn - Callback executado após o delay sem novas chamadas
 * @param delay - Intervalo em milissegundos (padrão 4000)
 */
export function useDebouncedCallback(fn: () => void, delay = 4000) {
  const fnRef = useRef(fn);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      setIsPending(false);
    };
  }, [clearTimer]);

  const cancel = useCallback(() => {
    clearTimer();
    setIsPending(false);
  }, [clearTimer]);

  const flush = useCallback(() => {
    clearTimer();
    setIsPending(true);
    fnRef.current();
    setIsPending(false);
  }, [clearTimer]);

  const debounced = useCallback(() => {
    setIsPending(true);
    clearTimer();
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      fnRef.current();
      setIsPending(false);
    }, delay);
  }, [clearTimer, delay]);

  return { debounced, flush, cancel, isPending };
}
